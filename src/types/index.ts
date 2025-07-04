import { TraderName } from "../data/traders";

export interface Task {
  id: string;
  minPlayerLevel: number;
  taskRequirements: TaskRequirement[];
  wikiLink: string;
  name: string;
  map: {
    name: string;
  } | null;
  trader: {
    name: TraderName;
  };
  kappaRequired?: boolean;
  lightkeeperRequired?: boolean;
}

export interface TaskRequirement {
  task: {
    id: string;
    name: string;
  };
}

export interface TaskData {
  data: {
    tasks: Task[];
  };
}
//{
//   "data": {
//     "task": {
//       "objectives": [
//         {
//           "items": [
//             {
//               "id": "5bc9c377d4351e3bac12251b",
//               "name": "Old firesteel",
//               "iconLink": "https://assets.tarkov.dev/5bc9c377d4351e3bac12251b-icon.webp"
//             }
//           ]
//         },
export interface CollectorItemsData {
  data: {
    task: {
      objectives: {
        items: {
          id: string;
          name: string;
          iconLink: string;
        }[];
      }[];
    };
    
  };
}

export interface TaskPosition {
  x: number;
  y: number;
  level: number;
}

export interface TaskPositions {
  [taskId: string]: TaskPosition;
}
