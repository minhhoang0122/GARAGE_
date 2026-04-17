export const ROLE_MAP: Record<string, string> = {
  ADMIN: "Quản trị viên",
  COVAN: "Cố vấn dịch vụ",
  QUAN_DOC: "Quản đốc xưởng",
  KHO: "Thủ kho",
  KE_TOAN: "Kế toán",
  SALE: "Nhân viên Sale",
};

export function formatRole(role: string): string {
  if (!role) return "Thành viên";
  return ROLE_MAP[role.toUpperCase()] || role;
}
