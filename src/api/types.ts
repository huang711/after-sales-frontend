// 对应后端的 LoginRequest.java DTO 
export interface LoginRequest {
    username?: string;
    password?: string;
}

// 对应后端的 JwtAuthenticationResponse.java DTO 
export interface JwtAuthenticationResponse {
    accessToken: string;
    tokenType: string;
    username: string;
    roles: string[];
}