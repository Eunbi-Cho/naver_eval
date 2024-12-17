import axios from 'axios';

export class ChatCompletionExecutor {
  private host: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;

  constructor() {
    this.host = process.env.HOST || '';
    this.clientId = process.env.CLIENT_ID || '';
    this.clientSecret = process.env.CLIENT_SECRET || '';
    if (!this.host || !this.clientId || !this.clientSecret) {
      throw new Error("Missing required environment variables");
    }
  }

  private async refreshAccessToken() {
    try {
      const response = await axios.get(`${this.host}/v1/auth/token?existingToken=true`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        }
      });
      this.accessToken = response.data.result.accessToken;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw error;
    }
  }

  async execute(completionRequest: any) {
    if (!this.accessToken) {
      await this.refreshAccessToken();
    }

    try {
      const response = await axios.post(
        `${this.host}/v1/chat-completions/HCX-DASH-001`,
        completionRequest,
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'text/event-stream',
            'Authorization': `Bearer ${this.accessToken}`
          },
          responseType: 'stream'
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        this.accessToken = null;
        return this.execute(completionRequest);
      }
      throw error;
    }
  }
}

