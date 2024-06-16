export const contactsMapper = (type: number) => {
    switch (type) {
        case 0: {
            return 'Телефон';
        }
        case 1: {
            return 'Email';
        }
        case 2: {
            return 'Telegram';
        }
        case 3: {
            return 'WhatsApp';
        }
        case 4: {
            return 'LinkedIn';
        }
        case 5: {
            return 'VK';
        }
        case 6: {
            return 'Facebook';
        }
        case 7: {
            return 'GitHub';
        }
        case 8: {
            return 'Skype';
        }
        case 9: {
            return 'Behance';
        }
        case 10: {
            return 'Dribbble';
        }
        case 11: {
            return 'Bitbucket';
        }
        default: {
            return 'YouTube';
        }
    }
};

export const isMainContact = (contactType: number) => {
    switch (contactType) {
        case 0: {
            return true;
        }
        case 1: {
            return true;
        }
        case 2: {
            return true;
        }
        case 3: {
            return false;
        }
        case 4: {
            return false;
        }
        case 5: {
            return false;
        }
        case 6: {
            return false;
        }
        case 7: {
            return false;
        }
        case 8: {
            return false;
        }
        case 9: {
            return false;
        }
        case 10: {
            return false;
        }
        case 11: {
            return false;
        }
        default: {
            return false;
        }
    }
};
