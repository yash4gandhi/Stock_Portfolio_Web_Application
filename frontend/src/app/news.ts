import { NewsSource } from "./news-source";
export interface News {
category : string | null;
datetime : number;
headline : string | null;
id : number;
image : string | null;
related : string | null;
source : string | null;
summary : string | null;
url : string | null;
}
