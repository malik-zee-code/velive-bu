// JWT utility functions
export interface HasuraClaims {
  "x-hasura-allowed-roles": string[];
  "x-hasura-default-role": string;
  "x-hasura-user-id": string;
  "x-hasura-user-is-anonymous": string;
}

export interface DecodedToken {
  exp: number;
  "https://hasura.io/jwt/claims": HasuraClaims;
  iat: number;
  iss: string;
  sub: string;
}

/**
 * Decodes a JWT token without verification
 * For client-side role extraction only
 */
export function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodedPayload) as DecodedToken;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

/**
 * Extracts the user role from the access token
 */
export function getUserRole(token: string): string | null {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }
  return decoded["https://hasura.io/jwt/claims"]["x-hasura-default-role"];
}

/**
 * Extracts the user ID from the access token
 */
export function getUserId(token: string): string | null {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }
  return decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
}

/**
 * Stores user role in localStorage
 */
export function storeUserRole(role: string[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("userRole", JSON.stringify(role.map((r: any) => r.role.toLowerCase())));
  }
}

/**
 * Gets user role from localStorage
 */
export function getStoredUserRole(): string[] | null {
  if (typeof window !== "undefined") {
    const userRole = localStorage.getItem("userRole");
    return userRole ? JSON.parse(userRole) : null;
  }
  return null;
}

/**
 * Clears stored user role
 */
export function clearStoredUserRole(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userRole");
  }
}

/**
 * Checks if user has a specific role
 */
export function hasRole(role: string): boolean {
  const storedRole = getStoredUserRole();
  return storedRole?.includes(role) || false;
}

/**
 * Checks if user is admin/manager
 */
export function isAdmin(): boolean {
  const role = getStoredUserRole();
  return role?.includes("manager") || role?.includes("admin") || false;
}

/**
 * Checks if user is regular user
 */
export function isOwner(): boolean {
  return hasRole("owner") || false;
}
