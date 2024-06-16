class VerificationCodeError(Exception):
    def __init__(self, message="Ошибка кода подтверждения"):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"


class RefreshTokenError(Exception):
    def __init__(self, message="Ошибка обновления токена"):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"


class RefreshTokenExpired(RefreshTokenError):
    def __init__(self, message="RefreshToken истек"):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"
