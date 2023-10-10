import { type VFC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { Icon } from '@proton/components';
import type { ModalProps } from '@proton/components/components/modalTwo/Modal';
import {
    selectVaultLimits,
    selectWritableVaults,
    selectWritableVaultsWithItemsCount,
} from '@proton/pass/store/selectors';
import { prop } from '@proton/pass/utils/fp';

import { SidebarModal } from '../../../shared/components/sidebarmodal/SidebarModal';
import { UpgradeButton } from '../../../shared/components/upgrade/UpgradeButton';
import { RadioButtonGroup, RadioLabelledButton } from '../../components/Field/RadioButtonGroupField';
import { ItemCard } from '../../components/Item/ItemCard';
import { PanelHeader } from '../../components/Panel/Header';
import { Panel } from '../../components/Panel/Panel';
import { VaultIcon } from '../../components/Vault/VaultIcon';

export type Props = Omit<ModalProps, 'onSubmit'> & {
    downgradeMessage: string;
    onSubmit: (shareId: string) => void;
    shareId: string;
};

/* if the user has downgraded : only allow him to select
 * his writable vaults as target. This rule applies when moving
 * an item to a vault or when selecting an item's vault */
export const VaultSelectModal: VFC<Props> = ({ downgradeMessage, onSubmit, shareId, ...props }) => {
    const vaultsWithItemCount = useSelector(selectWritableVaultsWithItemsCount);
    const writableShareIds = useSelector(selectWritableVaults).map(prop('shareId'));
    const { didDowngrade } = useSelector(selectVaultLimits);

    return (
        <SidebarModal {...props}>
            <Panel
                header={
                    <PanelHeader
                        actions={[
                            <Button
                                key="close-modal-button"
                                className="flex-item-noshrink"
                                icon
                                pill
                                shape="solid"
                                onClick={props.onClose}
                            >
                                <Icon className="modal-close-icon" name="cross-big" alt={c('Action').t`Close`} />
                            </Button>,
                            ...(didDowngrade ? [<UpgradeButton key="upgrade-button" />] : []),
                        ]}
                    />
                }
            >
                {didDowngrade && <ItemCard>{downgradeMessage}</ItemCard>}

                <RadioButtonGroup name="vault-select" className="flex-columns" value={shareId} onChange={onSubmit}>
                    {vaultsWithItemCount.map((vault) => (
                        <RadioLabelledButton
                            value={vault.shareId}
                            key={vault.shareId}
                            disabled={!writableShareIds.includes(vault.shareId)}
                        >
                            <VaultIcon
                                size={20}
                                background
                                color={vault.content.display.color}
                                icon={vault.content.display.icon}
                            />
                            <div className="flex flex-item-fluid flex-column">
                                <span className="text-ellipsis inline-block max-w-full color-norm">
                                    {vault.content.name}
                                </span>
                                <span className="block color-weak">{vault.count} items</span>
                            </div>
                        </RadioLabelledButton>
                    ))}
                </RadioButtonGroup>
            </Panel>
        </SidebarModal>
    );
};

export const useVaultSelectModalHandles = () => {
    const [modalState, setModalState] = useState<Pick<Props, 'shareId' | 'open'>>({ open: false, shareId: '' });

    return {
        modalState,
        ...useMemo(
            () => ({
                closeVaultSelect: () => setModalState((state) => ({ ...state, open: false })),
                openVaultSelect: (shareId: string) => setModalState({ shareId, open: true }),
            }),
            []
        ),
    };
};
