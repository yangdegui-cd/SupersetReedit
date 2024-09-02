// eslint-disable-next-line import/no-extraneous-dependencies
// @ts-ignore
import pinyin from 'pinyin';

// 函数：将中文字符串转换为拼音
const toPinyin = (str: string): string =>
  pinyin(str, {
    style: pinyin.STYLE_NORMAL,
  })
    .flat()
    .join('');

// 函数：将中文字符串转换为拼音首字母
const toPinyinAcronym = (str: string): string =>
  pinyin(str, {
    style: pinyin.STYLE_FIRST_LETTER,
  })
    .flat()
    .join('');

export function searchStrIncludes(
  str: string,
  searchStr: string,
  matchCase = false,
  matchPinyin = true,
): boolean {
  if (!str || !searchStr) return false;
  if (!matchCase) {
    // eslint-disable-next-line no-param-reassign
    str = str.toLowerCase();
    // eslint-disable-next-line no-param-reassign
    searchStr = searchStr.toLowerCase();
  }
  if (str.includes(searchStr)) return true;
  if (matchPinyin) {
    const strPinyin = toPinyin(str);
    if (strPinyin.includes(searchStr)) return true;
    const strPinyinAcronym = toPinyinAcronym(searchStr);
    if (strPinyinAcronym.includes(searchStr)) return true;
  }
  return false;
}

export function searchStrFilter<T>(
  list: T[],
  searchStr: string,
  keys: (keyof T)[] = [],
  matchCase = false,
  matchPinyin = true,
): T[] {
  return list.filter(item =>
    keys.some(key =>
      searchStrIncludes(String(item[key]), searchStr, matchCase, matchPinyin),
    ),
  );
}
