export const errorMsgs = {
  accessDenied: 'Access denied',
  accountStatementCreation: 'Error creating account statement',
  articleCreateError: 'Article creation error',
  articleDeleteError: 'Article delete error',
  articleNotFound: 'Article not found',
  articleTypeCreateError: 'Article type create error',
  articleTypeDeleteError: 'Article type delete error',
  articleTypeNameExists: 'Article type name already exists',
  articleTypeDisplayNameExists: 'Article type display name already exists',
  articleTypeNotFound: 'Article type not found',
  articleTypeUpdate: 'Article type update error',
  articleUpdateError: 'Article update error',
  balanceLimitExceeding: 'Превышение лимита общего баланса',
  bscScan: 'BscScan error',
  btsScan: 'BtsScan error',
  creatingPastPeriodEarnings: 'Создание прошедшего периода заработка запрещено',
  changingPastPeriodEarnings:
    'Изменение прошедшего периода заработка запрещено',
  childInvalid: 'Пользователь не является участником команды',
  codeInvalid: 'Code invalid',
  currencyDisplayNameExists: 'Currency display name already exists',
  currencyHasRelations: 'Currency has relations',
  currencyNotFound: 'Currency not found',
  currencyRateError: 'Error getting currency rate',
  currencySymbolExists: 'Currency symbol already exists',
  depositAddressHasTransfers:
    'Обновление адреса невозможно, имеются необработанные переводы',
  deleteFixedCurrencyRateExpiredError:
    'Delete fixed currency rate expired error',
  depositCancelationError: 'Deposit cancelation error',
  depositConfirmationError: 'Deposit confirmation error',
  depositMaxRequestsPerDay:
    'Достигнут лимит заявок на ввод средств. Попробуйте создать заявку завтра',
  emailExists: 'Пользователь с данной электронной почтой уже существует',
  emailNotFound: 'Email not found',
  emailNotVerified: 'Email not verified',
  etherScan: 'EtherScan error',
  fileNotExist: 'File does not exist',
  fileRelated: 'Файл имеет привязку',
  fixedCurrencyRateExpired: 'Fixed currency rate has expired',
  fixedCurrencyRateNotFound: 'Fixed currency rate not found',
  fromAddressRequired:
    'Необходимо указать адрес кошелька с которого будет осуществлен перевод',
  forgotDeletionError: 'Error deleting expired hash of forgotten password',
  forgotsDeletionError: 'Error deleting expired hashes of forgotten passwords',
  imageDuplicate: 'Изображение нельзя привязать дважды к одной сущности',
  incomeAccrual: 'Income accrual error',
  incomeAccrualCron: 'Income accrual cron error',
  insufficientBalance: 'Недостаточный баланс',
  invalidFileFormat: 'Invalid file format',
  investmentAmountLessThanProductPrice:
    'Размер инвестиции не соотвествует требуемым условиям продукта',
  investmentCancelation: 'Investment cancelation error',
  investmentCreation: 'Investment creation error',
  investmentComplete: 'Investment complete error',
  investmentCompletedEvent: 'Investment completed event error',

  investmentsCompleteCron: 'Cron job complete investments error',
  investmentExists: 'Investment already exists',
  investmentMaxAmount: 'Максимальная сумма инвестиций',
  investmentNotExists: 'Investment does not exist or expires',
  investmentNotFound: 'Investment not found',
  investmentReplenish: 'Investment replenish error',
  localeDisplayNameExists: 'Locale display name is already exists',
  localeNameExists: 'Locale name is already exists',
  localeNotFound: 'Article not found',
  linkNotValid: 'Link is not valid',
  linkExpired: 'Время действия ссылки истекло',
  localeHasRelations: 'Locale has relations',
  loginError: 'Логин или пароль указаны неверно',
  mailSingUpError: 'Error sending email to confirm email',
  maxQuantity: 'Максимально количество',
  maxLengthField: 'Максимально допустимая длина',
  maxDepositLimitError: 'Максимально допустимый баланс для пополнения',
  minDepositLimitError: 'Минимальная сумма для внесения',
  mimeTypeNotDefined: 'Mime type not defined',
  mustBeEmail: 'Должен быть указан валидный адрес электронной почты',
  minInvestmentAmount: 'Минимальная сумма для инвестиций',
  minWithdrawalLimitError: 'Минимальная сумма для вывода',
  mustBeInteger: 'Должно быть целым числом',
  mustBePhoneNumber: 'Необходимо указать валидным телефонный номер',
  mustBePositiveNumber: 'Должно быть положительным числом',
  mustBeString: 'Должна быть строка',
  networkDepositAddressExists: 'Network deposit address already exists',
  networkDisplayNameExists: 'Network display name already exists',
  networkNotFound: 'Network not found',
  networkMatchError: 'Cryptocurrency does not match the network',
  notEmptyField: 'Поле не должно быть пустым',
  noWhiteSpaces: 'Не должно быть пробелов',
  oldPasswordIncorrect: 'Неверный пароль',
  officeOpeningRequestNotify: 'Office opening request notify error',
  passwordMustMatch: `Пароль должен удовлетворять следующим условиям:
    - минимальная длина 8 символов
    - должен иметь хотя бы одно число
    - должен иметь хотя бы одну букву в верхнем регистре
    - должен иметь хотя бы одну букву в нижнем регистре
    - может содержать только латинские буквы
    - должен содержать один спец символ`,
  productCreateError: 'Product creation error',
  productDeleteError: 'Product delete error',
  productUpdateError: 'Product update error',
  productEarningsSettingNotFound: 'Product earnings setting not found',
  productEarningsSettingExists: 'Product earnings setting already exists',
  phoneExists: 'Пользователь с данным номером телефона уже существует',
  phoneNotVerified: 'Phone not verified',
  productNameExists: 'Product name already exists',
  productNotFound: 'Product not found',
  queueError: (queueName: string) => `Queue ${queueName} error`,
  raffleCreateError: 'Raffle creation error',
  raffleDeleteError: 'Raffle delete error',
  raffleNotFound: 'Raffle not found',
  raffleUpdateError: 'Raffle update error',
  recaptchaFailed: 'Verify google recaptcha error',
  referralLevelExists: 'Referral program level already exists',
  referralLevelNotFound: 'Referral program level not found',
  referralLevelsMaxNumber: 'Maximum number of referral levels',
  referralLevelsPercentageLimit:
    'Total percentage of referral levels exceeded. Max limit',
  roleNotExist: 'Role does not exist',
  roleNameExists: 'Role name already exists',
  roleDisplayNameExists: 'Role display name already exists',
  s3FileUploadError: 'S3 Yandex cloud file upload error',
  smsRuError: 'SmsRu error',
  telegramWebhook: 'Telegram webhook error',
  telegramWebhookOptions:
    'Backend domain or telegram webhook token not specified',
  telegramWebhookTokenIncorrect: 'Telegram webhook token incorrect',
  tokenPayload: 'There is no user ID in the token payload',
  tokenTypeUnknown: 'Unknown token type',
  transactionAfterCommitInsert: 'Transaction after commit insert error',
  transactionCodeDeletionError: 'Error deleting expired transaction code',
  transactionCodesDeletionError: 'Error deleting expired transaction codes',
  transactionCodeInvalid:
    'Код внтуреннего перевода неверный или истек срок действия',
  transactionInternalMaxLimitError:
    'Максимальная сумма для внутреннего перевода',
  transactionInternalMinLimitError:
    'Минимальная сумма для внутреннего перевода',
  transactionInternalSendCodeError:
    'Error sending confirmation code for internal transaction',
  transactionInternalYourSelf: 'Transferring funds to yourself is not possible',
  transactionTypeCreateError: 'Transaction type creation error',
  transactionTypeNameExists: 'Transaction type name already exists',
  transactionTypeDisplayNameExists:
    'Transaction type display name already exists',
  transactionTypeNotFound: 'Transaction type not found',
  transactionTypeUpdateError: 'Transaction type update error',
  transferAddScanQueue:
    'Error adding transfer to scanning queuetransferAddScanQueue',
  transferAlreadyCompleted: 'Трансфер уже завершен',
  transferCodeInvalid: 'Код неверный или истек срок действия',
  transferCodeDeletionError: 'Error deleting expired transfer code',
  transferCodesDeletionError: 'Error deleting expired transfer codes',
  transferCompleted: 'Transfer already completed',
  transferCronCancelExpired: 'Cron canceling expired transfer error',
  transferCurrencyInvalid: 'Transfer currency invalid',
  transferDepositCreationError: 'Error creating deposit transfer',
  transfersDepositProcessing: 'Deposit transfers processing error',
  transferTokenTypeInvalid: 'Transfer token type invalid',
  transferWithdrawalConfirmationError: 'Error confirmation withdrawal transfer',
  transferWithdrawalCreationError: 'Error creating withdrawal transfer',
  transferWithdrawalSendCodeError:
    'Error sending confirmation code for withdrawal transfer',
  transferHasClosedTransaction:
    'Transfer has a transaction included to closed account statement',
  transferHasTransaction: 'The transfer already has a deposit transaction',
  transferNextDayCancellation:
    'Только супер админ может изменить закрытую заявку по окончанию дня закрытия',
  transferHasNoTxId: 'У трансфера отсутсвует TxId',
  transferNotFound: 'Transfer not found',
  transferMustBeDeposit: 'Трансфер должен быть входящим',
  transferMustBePending:
    'To be processed, the transfer must be in pending status',
  transferMustBeWithdrawal: 'Transfer type must be withdrawal',
  transferDepositReConfirm: 'The transfer was canceled. Contact super admin',
  transferDepositCanceledEvent: 'Deposit transfer canceled event error',
  transferDepositCompletedEvent: 'Deposit transfer completed event error',
  transferProcessedEvent: 'Transfer processed event error',
  transferStatusNameExists: 'Transfer status name already exists',
  transferStatusDisplayNameExists:
    'Transfer status display name already exists',
  transferStatusNotFound: 'Transfer status not found',
  transferTxIdAddedEvent: 'Transfer TxID added event error',
  transferTypeDisplayNameExists: 'Transfer type display name already exists',
  tranfserTypeNotFound: 'Transfer type not found',
  transferUpdateForbidden: 'Transfer update forbidden',
  transferWithdrawReConfirm: 'Transfer already completed',
  transferWithdrawalCreatedEvent: 'Withdrawal transfer created event error',
  transferWithdrawalCompletedEvent: 'Withdrawal transfer completed event error',
  tronScan: 'TronScan error',
  txIdRequired: 'TxId required',
  txIdUpdateError: 'TxId adding error',
  userCreateError: 'User creation transaction error',
  userDeleteError: 'User deletion transaction error',
  userDeleted: 'Пользователь удален',
  userExists: 'Пользователь с такой электронной почтой уже существует',
  userNotFound: 'User not found',
  userSoftDeleteError: 'User soft deletion transaction error',
  userStatusNotExist: 'User Status does not exist',
  userStatusDisplayNameExists: 'User status display name already exists',
  userStatusNameExists: 'User status name already exists',
  userWalletNotFound: 'User wallet not found',
  userWalletsLimit:
    'Достигнуто максимальное количество кошельков для вывода криптовалюты',
};