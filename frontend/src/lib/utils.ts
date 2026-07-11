import { format, parseISO, addDays, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'yyyy년 M월 d일 (E)', { locale: ko });
  } catch {
    return dateString;
  }
};

export const formatDateShort = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MM/dd', { locale: ko });
  } catch {
    return dateString;
  }
};

export const getDaysFromNow = (dateString: string): number => {
  try {
    return differenceInDays(parseISO(dateString), new Date());
  } catch {
    return 0;
  }
};

export const addDaysToDate = (dateString: string, days: number): string => {
  try {
    return format(addDays(parseISO(dateString), days), 'yyyy-MM-dd');
  } catch {
    return dateString;
  }
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ko-KR').format(Math.round(price)) + '원';
};

export const formatVolume = (volume: number): string => {
  return volume + '톤';
};

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};