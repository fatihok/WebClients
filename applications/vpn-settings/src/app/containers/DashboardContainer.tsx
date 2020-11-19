import React, { useEffect } from 'react';
import {
    PlansSection,
    SubscriptionSection,
    BillingSection,
    useUser,
    SettingsPropsShared,
    useModals,
    NewSubscriptionModal,
    usePlans,
    useSubscription,
    useOrganization,
} from 'react-components';
import { PERMISSIONS, DEFAULT_CYCLE, PLAN_SERVICES } from 'proton-shared/lib/constants';
import { Plan, UserModel } from 'proton-shared/lib/interfaces';
import { c } from 'ttag';
import isTruthy from 'proton-shared/lib/helpers/isTruthy';
import { getPlanIDs, switchPlan } from 'proton-shared/lib/helpers/subscription';
import { PlanIDs } from 'react-components/containers/signup/interfaces';
import { toMap } from 'proton-shared/lib/helpers/object';
import { SUBSCRIPTION_STEPS } from 'react-components/containers/payments/subscription/constants';

import PrivateMainSettingsAreaWithPermissions from '../components/page/PrivateMainSettingsAreaWithPermissions';

const { UPGRADER, PAID } = PERMISSIONS;

export const getDashboardPage = (user: UserModel) => {
    return {
        text: c('Title').t`Dashboard`,
        to: '/dashboard',
        icon: 'dashboard',
        permissions: [UPGRADER],
        subsections: [
            !user.hasPaidVpn && {
                text: c('Title').t`Plans`,
                id: 'plans',
            },
            {
                text: c('Title').t`Subscription`,
                id: 'subscription',
                permissions: [PAID],
            },
            {
                text: c('Title').t`Billing`,
                id: 'billing',
                permissions: [PAID],
            },
        ].filter(isTruthy),
    };
};

interface PlansMap {
    [planName: string]: Plan;
}

const DashboardContainer = ({ setActiveSection, location }: SettingsPropsShared) => {
    const [user] = useUser();
    const { createModal } = useModals();
    const searchParams = new URLSearchParams(location.search);
    const planName = searchParams.get('plan');
    const cycle = searchParams.get('cycle');
    const currency = searchParams.get('currency');
    const coupon = searchParams.get('coupon');
    const [plans, loadingPlans] = usePlans();
    const [subscription, loadingSubscription] = useSubscription();
    const [organization, loadingOrganization] = useOrganization();

    useEffect(() => {
        if (plans && planName && !loadingPlans && !loadingSubscription && !loadingOrganization) {
            if (!planName) {
                return;
            }
            const { Cycle = cycle || DEFAULT_CYCLE, Currency = currency || plans[0].Currency } = subscription;
            const plansMap = toMap(plans, 'Name') as PlansMap;
            if (user.isFree) {
                const planIDs = planName.split('_').reduce<PlanIDs>((acc, name) => {
                    acc[plansMap[name].ID] = 1;
                    return acc;
                }, {});
                createModal(
                    <NewSubscriptionModal
                        planIDs={planIDs}
                        currency={Currency}
                        cycle={Cycle}
                        coupon={coupon}
                        step={SUBSCRIPTION_STEPS.PAYMENT}
                    />
                );
                return;
            }
            const plan = plansMap[planName];
            if (!plan) {
                return;
            }
            const planIDs = switchPlan({
                planIDs: getPlanIDs(subscription),
                plans,
                planID: plan.ID,
                service: PLAN_SERVICES.VPN,
                organization,
            });
            createModal(<NewSubscriptionModal planIDs={planIDs} currency={Currency} cycle={Cycle} />);
        }
    }, [loadingPlans, loadingSubscription, loadingOrganization]);

    return (
        <PrivateMainSettingsAreaWithPermissions
            location={location}
            config={getDashboardPage(user)}
            setActiveSection={setActiveSection}
        >
            {!user.hasPaidVpn ? <PlansSection /> : null}
            <SubscriptionSection />
            <BillingSection />
        </PrivateMainSettingsAreaWithPermissions>
    );
};

export default DashboardContainer;
