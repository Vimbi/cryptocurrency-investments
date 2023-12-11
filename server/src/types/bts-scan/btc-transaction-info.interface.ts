export interface IBtcTransactionInfo {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string; // address
  value: number; // amount /100000000
}
