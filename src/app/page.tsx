import { vaultData } from "@/lib/vault-data";
import BrainApp from "@/components/BrainApp";

export default function Page() {
  return <BrainApp data={vaultData} />;
}
