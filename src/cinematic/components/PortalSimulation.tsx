import { HotlineSim } from './sim/HotlineSim';
import { PortalSim } from './sim/PortalSim';
import { AppSim } from './sim/AppSim';
import { ApiSim } from './sim/ApiSim';

type PortalSimulationProps = {
  tpaName: string;
  accessMethod: 'api' | 'portal' | 'hotline' | 'app';
};

export function PortalSimulation({ tpaName, accessMethod }: PortalSimulationProps) {
  switch (accessMethod) {
    case 'hotline':
      return <HotlineSim tpaName={tpaName} />;
    case 'portal':
      return <PortalSim />;
    case 'app':
      return <AppSim />;
    case 'api':
      return <ApiSim />;
  }
}
