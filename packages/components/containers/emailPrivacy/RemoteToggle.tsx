import { c } from 'ttag';

import { SHOW_IMAGES } from '@proton/shared/lib/constants';
import { updateShowImages } from '@proton/shared/lib/api/mailSettings';
import { setBit, clearBit, hasBit } from '@proton/shared/lib/helpers/bitset';

import { Toggle } from '../../components';
import { useEventManager, useToggle, useNotifications, useApi, useLoading } from '../../hooks';

const { REMOTE } = SHOW_IMAGES;

interface Props {
    id: string;
    showImages: number;
    onChange: (value: number) => void;
}

const RemoteToggle = ({ id, showImages, onChange, ...rest }: Props) => {
    const [loading, withLoading] = useLoading();
    const { createNotification } = useNotifications();
    const { call } = useEventManager();
    const api = useApi();
    const { state, toggle } = useToggle(hasBit(showImages, REMOTE));

    // Use !checked because we want to display ON toggle if auto load is disabled and vice versa
    const handleChange = async (checked: boolean) => {
        const bit = !checked ? setBit(showImages, REMOTE) : clearBit(showImages, REMOTE);
        await api(updateShowImages(bit));
        await call();
        toggle();
        onChange(bit);
        createNotification({ text: c('Success').t`Preference saved` });
    };
    return (
        <Toggle
            id={id}
            checked={!state} // Use !state because we want to display ON toggle if auto load is disabled and vice versa
            onChange={({ target }) => withLoading(handleChange(target.checked))}
            loading={loading}
            {...rest}
        />
    );
};

export default RemoteToggle;
