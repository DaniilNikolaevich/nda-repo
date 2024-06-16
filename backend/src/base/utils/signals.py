class SignalDisconnect:
    def __init__(self, signal, method, sender, dispatch_uid):
        self.signal = signal
        self.method = method
        self.sender = sender
        self.dispatch_uid = dispatch_uid

    def __enter__(self):
        self.signal.disconnect(
            self.method,
            sender=self.sender,
            dispatch_uid=self.dispatch_uid
        )

    def __exit__(self, *args):
        self.signal.connect(
            self.method,
            sender=self.sender,
            dispatch_uid=self.dispatch_uid
        )
