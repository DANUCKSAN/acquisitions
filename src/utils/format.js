import { json } from "zod";

export const formatValidationError=(errors) => {
    if (!errors || !errors.issues) return 'Unknown validation error';
    if(Array.isArray(errors.issues)) return errors.issues.map(i=> i.message).join(', ');
    return json.stringify(errors);
};  