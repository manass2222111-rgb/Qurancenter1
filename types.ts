
export interface Student {
  id: string; // م
  name: string; // اسم الدارس
  nationality: string; // الجنسية
  dob: string; // تاريخ الميلاد
  phone: string; // رقم الهاتف
  age: string; // العمر
  qualification: string; // المؤهل الدراسي
  job: string; // العمل
  address: string; // السكن
  regDate: string; // تاريخ التسجيل
  level: string; // المستوى
  part: string; // الجزء
  nationalId: string; // رقم الهوية
  category: string; // الفئة
  period: string; // الفترة
  expiryId: string; // انتهاء الهوية
  teacher: string; // اسم المحفظ
  fees: string; // الرسوم
  circle: string; // الحلقة
  completion: string; // نسبة اكتمال المعلومات
}

export type ViewType = 'dashboard' | 'table' | 'add';
