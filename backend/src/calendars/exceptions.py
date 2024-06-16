class ExternalCalendarNotSet(Exception):
    def __init__(self, message="Настройки внешнего календаря не заданы"):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"
