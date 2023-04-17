import { collection, doc, getDocs, query, setDoc } from "firebase/firestore";
import { nanoid } from "nanoid";

import type { DocumentData, DocumentReference} from "firebase/firestore";

export const logActionNames = {
  ADD_PRODUCT_FEATURE: `ADD_PRODUCT_FEATURE`,
  DELETE_PRODUCT_FEATURE: `DELETE_PRODUCT_FEATURE`,
  UPDATE_PRODUCT_FEATURE: `UPDATE_PRODUCT_FEATURE`,
  GENERATE_VISION_STATEMENT: `GENERATE_VISION_STATEMENT`,
  UPDATE_VISION_STATEMENT: `UPDATE_VISION_STATEMENT`,
  ADD_USER: `ADD_USER`,
  DELETE_USER: `DELETE_USER`,
  UPDATE_USER: `UPDATE_USER`
}

type LogActionName = keyof typeof logActionNames
type LogActionGroup = `ACCESSIBILITY` | `KICKOFF` | `VISION` | `OBJECTIVES` | `VISION`
type LogActionType = `CREATE` | `UPDATE` | `DELETE`

export type LogEntry = {
  userId: string;
  timestamp: Date;
  actionName: LogActionName;
  actionGroup: LogActionGroup;
  actionType: LogActionType
  message?: string;
};

// Generate a custom message for the log entry
const generateMessage = (logEntry: LogEntry): string => {
  const { actionName } = logEntry;
  const userDisplayName = `Adil Gurbanov`
  switch (actionName) {
    case logActionNames.ADD_PRODUCT_FEATURE:
      //return `A new feature ${details?.name} was added by ${userDisplayName}`;
      return `A new feature was added by @${userDisplayName}`;
    case logActionNames.DELETE_PRODUCT_FEATURE:
      //return `Feature ${details?.name} was removed by ${userDisplayName}`;
      return `Feature was removed by @${userDisplayName}`;
    case logActionNames.GENERATE_VISION_STATEMENT:
      return `Statement generated by ScrumGenie`;
    case logActionNames.UPDATE_VISION_STATEMENT:
      return `Statement generated by ScrumGenie`;
    // Add more cases for other actions
    default:
      return `Action was performed by @${userDisplayName}`;
  }
};

// Fetch logs from Firestore and generate messages for each log entry
export const fetchLogs = async (productRef: DocumentReference<DocumentData>, actionGroup: LogActionGroup, actionName?: LogActionName): Promise<LogEntry[]> => {
  //const dbLogs = await getDocs(query(collection(productRef, `Logs`), where(`actionGroup`, `===`, actionGroup)))
  const dbLogs = await getDocs(query(collection(productRef, `Logs`)))
  const logs = dbLogs.docs.map((doc) => {
    const logEntry = doc.data() as LogEntry;
    logEntry.message = generateMessage(logEntry);
    return logEntry;
  });
  return logs;
};

export const logAction = async (
  productRef: DocumentReference<DocumentData>,
  logData: LogEntry
): Promise<void> => {
  const logEntry: LogEntry = logData;
  await setDoc(doc(productRef, nanoid()), {
    logEntry
  })
};