import { spfi } from "@pnp/sp";

export interface IProject1Props {
  sp: ReturnType<typeof spfi>;
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
