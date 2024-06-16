export interface AuthorizationSetPasswordDTO {
    verification_code: string;
    password: string;
    password_confirm: string;
}

export interface AuthorizationSignInDTO {
    email: string;
    password: string;
}

export interface AuthorizationSignInResponseDTO {
    access_token: string;
    refresh_token: string;
}

export interface AuthorizationResetPasswordDTO {
    email: string;
}
