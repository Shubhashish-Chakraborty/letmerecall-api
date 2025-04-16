import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 3000;
// export const SWS_SENDERMAIL_VERIFICATION = process.env.SWS_SENDERMAIL_VERIFICATION;
// export const SWSMAIL_PASSWORD = process.env.SWSMAIL_PASSWORD;
// export const JWT_USER_SECRET = process.env.JWT_USER_SECRET as string;