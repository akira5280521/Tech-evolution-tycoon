import { useGameState } from "./GameState";
import { CompanyNameForm } from "./GoalsPanel";
import { Panel } from "./chrome";

// More > Settings: rename the company shown in the news ticker.
export default function CompanySetting() {
  const { state, setCompanyName } = useGameState();
  return (
    <Panel>
      <h2 className="font-pixel text-[0.6rem]">COMPANY NAME</h2>
      <p data-company-name className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
        {state.companyName ? `Now: ${state.companyName}` : "Not named yet."} It shows up in the news ticker.
      </p>
      <CompanyNameForm key={state.companyName || "none"} current={state.companyName || ""} onSave={setCompanyName} button="RENAME" />
    </Panel>
  );
}
