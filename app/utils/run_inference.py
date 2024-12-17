import os
import base64
import requests
from http import HTTPStatus
import json
from typing import List, Dict, Any
import traceback

class ChatCompletionExecutor:
    def __init__(self):
        self._host = os.environ.get('host')
        self._client_id = os.environ.get('client_id')
        self._client_secret = os.environ.get('client_secret')
        if not all([self._host, self._client_id, self._client_secret]):
            raise ValueError("Missing required environment variables")
        self._encoded_secret = base64.b64encode(f'{self._client_id}:{self._client_secret}'.encode('utf-8')).decode('utf-8')
        self._access_token = None

    def _refresh_access_token(self):
        try:
            headers = {
                'Authorization': f'Basic {self._encoded_secret}'
            }

            response = requests.get(f'{self._host}/v1/auth/token?existingToken=true', headers=headers)
            response.raise_for_status()

            token_info = response.json()
            self._access_token = token_info['result']['accessToken']
        except requests.RequestException as e:
            print(f"Error refreshing access token: {e}")
            raise

    def execute(self, completion_request):
        if self._access_token is None:
            self._refresh_access_token()

        headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'text/event-stream',
            'Authorization': f'Bearer {self._access_token}'
        }

        try:
            response = requests.post(f'{self._host}/v1/chat-completions/HCX-DASH-001', headers=headers, json=completion_request, stream=True)
            response.raise_for_status()

            if response.status_code == HTTPStatus.UNAUTHORIZED:
                self._access_token = None
                return self.execute(completion_request)
            elif response.status_code == HTTPStatus.OK:
                return response.text
            else:
                raise ValueError(f"Unexpected status code: {response.status_code}")
        except requests.RequestException as e:
            print(f"Error executing request: {e}")
            raise

def run_inference(data: List[Dict[str, Any]], system_prompt: str, user_input: str) -> List[Dict[str, Any]]:
    if not data:
        raise ValueError("No data provided for inference")

    try:
        chat_completion_executor = ChatCompletionExecutor()

        for row in data:
            try:
                system = row.get(system_prompt, "") if system_prompt else ""
                text = row.get(user_input, "") if user_input else ""
                
                request_data = {
                    "messages": [{
                        "role": "system",
                        "content": system
                    }, {
                        "role": "user",
                        "content": text
                    }],
                    'maxTokens': 400,
                    'temperature': 0.5,
                    'topK': 0,
                    'topP': 0.8,
                    'repeatPenalty': 5.0,
                    'stopBefore': [],
                    'includeAiFilters': True,
                    'seed': 0
                }

                response = chat_completion_executor.execute(request_data)
                
                response_content = ""
                for line in response.split('\n'):
                    if line.startswith('data:'):
                        try:
                            json_data = json.loads(line[5:])
                            if 'message' in json_data:
                                response_content += json_data['message']['content']
                        except json.JSONDecodeError:
                            print(f"Error decoding JSON: {line}")
                
                row['assistant'] = response_content.strip()
            except Exception as e:
                print(f"Error processing row: {e}")
                row['assistant'] = f"Error occurred during inference: {str(e)}"

        return data
    except Exception as e:
        print(f"Error in run_inference: {e}")
        print(traceback.format_exc())
        raise

