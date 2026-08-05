import { db } from "./src/db/client.ts";

import { 
  notes as notesTable,
  encounters as encountersTable
} from "./src/db/schema.ts";

import { eq, asc } from "drizzle-orm";
import type{
  Encounter,
  Note,
} from "./src/types.ts";


const currentUserId = "demo";

function test() {

    const rows =  db
        .select({
            id: notesTable.id,
            content: notesTable.content,
        })
        .from(notesTable)
        .where(eq(notesTable.userId, currentUserId));

    console.log(rows);
}

test();