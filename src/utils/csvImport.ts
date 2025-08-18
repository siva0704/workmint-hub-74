
import { User, UserRole } from '@/types';

interface CSVUserData {
  name: string;
  email?: string;
  mobile: string;
  role: UserRole;
}

interface ImportResult {
  success: boolean;
  users: User[];
  errors: string[];
  totalProcessed: number;
}

export const parseCSVFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsText(file);
  });
};

export const validateCSVHeaders = (headers: string[]): boolean => {
  const requiredHeaders = ['name', 'mobile', 'role'];
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  return requiredHeaders.every(header => 
    normalizedHeaders.includes(header)
  );
};

export const parseCSVUsers = (csvContent: string, tenantId: string): ImportResult => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const errors: string[] = [];
  const users: User[] = [];
  
  if (lines.length < 2) {
    return {
      success: false,
      users: [],
      errors: ['CSV file must contain at least a header row and one data row'],
      totalProcessed: 0,
    };
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  if (!validateCSVHeaders(headers)) {
    return {
      success: false,
      users: [],
      errors: ['CSV must contain columns: name, mobile, role (email is optional)'],
      totalProcessed: 0,
    };
  }

  // Get column indices
  const nameIndex = headers.indexOf('name');
  const emailIndex = headers.indexOf('email');
  const mobileIndex = headers.indexOf('mobile');
  const roleIndex = headers.indexOf('role');

  for (let i = 1; i < lines.length; i++) {
    const rowData = lines[i].split(',').map(cell => cell.trim());
    const rowNumber = i + 1;

    try {
      // Validate required fields
      const name = rowData[nameIndex];
      const mobile = rowData[mobileIndex];
      const roleString = rowData[roleIndex]?.toLowerCase();
      const email = emailIndex >= 0 ? rowData[emailIndex] : '';

      if (!name) {
        errors.push(`Row ${rowNumber}: Name is required`);
        continue;
      }

      if (!mobile) {
        errors.push(`Row ${rowNumber}: Mobile number is required`);
        continue;
      }

      // Validate role
      const validRoles: UserRole[] = ['factory_admin', 'supervisor', 'employee'];
      const role = validRoles.find(r => r === roleString || r.includes(roleString));
      
      if (!role) {
        errors.push(`Row ${rowNumber}: Invalid role "${roleString}". Must be one of: factory_admin, supervisor, employee`);
        continue;
      }

      // Validate email format if provided
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push(`Row ${rowNumber}: Invalid email format`);
        continue;
      }

      // Validate mobile format (basic validation)
      if (!/^\+?[\d\s\-\(\)]{10,}$/.test(mobile)) {
        errors.push(`Row ${rowNumber}: Invalid mobile number format`);
        continue;
      }

      // Generate auto ID
      const autoId = `EMP${String(users.length + 1).padStart(3, '0')}`;

      const user: User = {
        id: `user_${Date.now()}_${i}`,
        autoId,
        name,
        email: email || `${autoId.toLowerCase()}@${tenantId}.local`,
        mobile,
        role,
        tenantId,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      users.push(user);
    } catch (error) {
      errors.push(`Row ${rowNumber}: Error processing data - ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    users,
    errors,
    totalProcessed: lines.length - 1,
  };
};

export const generateCSVTemplate = (): string => {
  const headers = ['name', 'email', 'mobile', 'role'];
  const sampleData = [
    ['John Smith', 'john.smith@company.com', '+1234567890', 'employee'],
    ['Jane Supervisor', 'jane.super@company.com', '+1234567891', 'supervisor'],
    ['Admin User', 'admin@company.com', '+1234567892', 'factory_admin'],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};
