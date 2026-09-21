// question schema for the game, stored in a YAML file and loaded at runtime

import { z } from "zod"

export const questionSchema = z.object({
    question: z.string(),
    file: z.string(),
    variable: z.string(),
    variable_label: z.string().nullable().optional(),
    statistic: z.enum(["max", "min"]),
    top_n: z.number().int().positive(),
    story: z.string(),
    time_limit: z.number().int().positive().nullable().optional()
})