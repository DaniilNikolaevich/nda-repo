export const nothingToNull = (value: string | null): string | null => {
    // eslint-disable-next-line no-underscore-dangle
    let _value = value;

    if (_value == null) {
        return null;
    }
    _value = _value.trim();

    if (_value.length === 0) {
        return null;
    }
    return value;
};
