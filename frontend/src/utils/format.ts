/**
 * 统一格式化工具
 */

/**
 * 日期格式化
 */
export class DateFormat {
  /**
   * 格式化日期
   * @param date 日期对象、时间戳或日期字符串
   * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
   * @returns 格式化后的日期字符串
   */
  static format(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : typeof date === 'number' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * 相对时间（多久之前）
   */
  static relative(date: Date | string | number): string {
    const d = typeof date === 'string' ? new Date(date) : typeof date === 'number' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 365 * day;

    if (diff < minute) {
      return '刚刚';
    } else if (diff < hour) {
      return `${Math.floor(diff / minute)}分钟前`;
    } else if (diff < day) {
      return `${Math.floor(diff / hour)}小时前`;
    } else if (diff < month) {
      return `${Math.floor(diff / day)}天前`;
    } else if (diff < year) {
      return `${Math.floor(diff / month)}个月前`;
    } else {
      return `${Math.floor(diff / year)}年前`;
    }
  }

  /**
   * 获取日期范围
   */
  static getRange(type: 'today' | 'week' | 'month' | 'year'): { start: string; end: string } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    let start: Date;
    let end: Date;

    switch (type) {
      case 'today':
        start = new Date(year, month, date, 0, 0, 0);
        end = new Date(year, month, date, 23, 59, 59);
        break;
      case 'week':
        const weekDay = now.getDay() || 7; // 周日为7
        start = new Date(year, month, date - weekDay, 0, 0, 0);
        end = new Date(year, month, date - weekDay + 7, 23, 59, 59);
        break;
      case 'month':
        start = new Date(year, month, 1, 0, 0, 0);
        end = new Date(year, month + 1, 0, 23, 59, 59);
        break;
      case 'year':
        start = new Date(year, 0, 1, 0, 0, 0);
        end = new Date(year, 11, 31, 23, 59, 59);
        break;
    }

    return {
      start: this.format(start!),
      end: this.format(end!),
    };
  }
}

/**
 * 数字格式化
 */
export class NumberFormat {
  /**
   * 格式化金额
   */
  static currency(amount: number | string, decimals: number = 2): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0.00';

    return num.toFixed(decimals);
  }

  /**
   * 格式化百分比
   */
  static percent(value: number | string, decimals: number = 2): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0.00%';

    return `${num.toFixed(decimals)}%`;
  }

  /**
   * 格式化大数字（带单位）
   */
  static largeNumber(num: number | string): string {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0';

    if (n >= 10000) {
      return `${(n / 10000).toFixed(1)}万`;
    } else if (n >= 100000000) {
      return `${(n / 100000000).toFixed(1)}亿`;
    } else {
      return n.toString();
    }
  }
}

/**
 * 文件大小格式化
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 手机号格式化
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * 身份证号格式化（隐藏中间部分）
 */
export function formatIdCard(idCard: string): string {
  if (!idCard || idCard.length < 18) return idCard;

  return `${idCard.slice(0, 6)}********${idCard.slice(14)}`;
}
