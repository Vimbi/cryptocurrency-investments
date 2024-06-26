export interface SMSRuGetCostOptions {
  /**
   * Номер телефона получателя (либо несколько
   * номеров до 100 штук за один запрос).
   * Вы также можете указать номера в виде массива
   * ```js
   * {
   *  'номер получателя': 'текст',
   *  'номер получателя 2': 'текст'
   * }
   * ```
   * Если вы указываете несколько номеров и один из них указан
   * неверно, то вместо идентификатора сообщения в выдаче вы
   * получите трехзначный код ошибки.
   */
  to?: string | string[] | { [phoneNumber: string]: string };

  /**
   * Текст сообщения
   */
  msg?: string;

  /**
   * Если вы хотите в одном запросе отправить разные сообщения
   * на несколько номеров, то воспользуйтесь этим параметром
   * (до 100 сообщений за 1 запрос). В этом случае, параметры
   * `to` и `msg` использовать не нужно: каждое сообщение передается
   * в виде
   * ```js
   * {
   *  'номер получателя': 'текст',
   *  'номер получателя 2': 'текст'
   * }
   * ```
   * Если вы указываете несколько номеров и один из них указан неверно,
   * то вместо идентификатора сообщения в выдаче вы получите
   * трехзначный код ошибки.
   */
  multi?: { [phoneNumber: string]: string };

  /**
   * Имя отправителя (должно быть согласовано с
   * администрацией). Если не заполнено, в качестве
   * отправителя будет указан ваш отправитель по умолчанию.
   */
  from?: string;

  /**
   * Переводит все русские символы в латинские
   */
  transit?: boolean;
}
