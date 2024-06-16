export const readyToMove = (ready: boolean) => {
    switch (ready) {
        case false: {
            return 'не готов к переезду';
        }
        default: {
            return 'готов к переезду';
        }
    }
};

export const readyToBusinessTrip = (ready: boolean) => {
    switch (ready) {
        case false: {
            return 'не готов к командировкам';
        }
        default: {
            return 'готов к командировкам';
        }
    }
};
