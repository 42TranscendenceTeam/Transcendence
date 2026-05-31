export const ALLOWED_TASK_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/zip',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const ALLOWED_TASK_EXTENSIONS = '.pdf,.png,.jpg,.jpeg,.zip,.txt,.docx';

export const MAX_TASK_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export function validateTaskFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TASK_FILE_TYPES.includes(file.type as any)) {
    return { valid: false, error: 'File type not allowed. Accepted: PDF, PNG, JPEG, ZIP, TXT, DOCX' };
  }
  if (file.size > MAX_TASK_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 20 MB' };
  }
  return { valid: true };
}
