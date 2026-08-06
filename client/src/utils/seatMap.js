export const ZONE = {
  Standard: { color: '#10b981', label: (vi) => 'Hoàn Ảnh' },
  Premium:  { color: '#5aaddc', label: (vi) => 'Khởi Ảnh' },
  VIP:      { color: '#a896f6', label: (vi) => 'Nhất Ảnh' },
};

export const S  = 16;
export const TOP_COL_PITCH = 28;
export const COL_PITCH     = 20;
export const ROW_PITCH     = 20;
export const ROW_LABEL_W   = 24;

export const TOP_COLS = 10;
export const TOP_ROWS = 20;
export const BOT_ROWS = 8;
export const BOT_COLS = 25;

export const RUNWAY_W  = 70;
export const STAGE_H   = 44;
export const STAGE_RISER = 12;

export const RUNWAY_SEAT_GAP = 16;
export const TOP_BOT_GAP    = 32;
export const CENTER_AISLE_W = RUNWAY_W;

export const CANVAS_MARGIN = 40;

export const TOP_BLOCK_W = TOP_COLS * TOP_COL_PITCH - (TOP_COL_PITCH - S);
export const BOT_BLOCK_W = BOT_COLS * COL_PITCH - (COL_PITCH - S);

export const TOP_TOTAL_W = TOP_BLOCK_W * 2 + RUNWAY_W + RUNWAY_SEAT_GAP * 2;
export const BOT_TOTAL_W = BOT_BLOCK_W * 2 + CENTER_AISLE_W;

export const STAGE_W = TOP_TOTAL_W;
export const INNER_W = Math.max(TOP_TOTAL_W, BOT_TOTAL_W);
export const CANVAS_W = INNER_W + CANVAS_MARGIN * 2;

export const CX = CANVAS_W / 2;
export const TOP_LEFT_X  = CX - RUNWAY_W / 2 - RUNWAY_SEAT_GAP - TOP_BLOCK_W;
export const TOP_RIGHT_X = CX + RUNWAY_W / 2 + RUNWAY_SEAT_GAP;

export const BOT_LEFT_X  = CX - CENTER_AISLE_W / 2 - BOT_BLOCK_W;
export const BOT_RIGHT_X = CX + CENTER_AISLE_W / 2;

export const STAGE_Y    = 16;
export const STAGE_BOT  = STAGE_Y + STAGE_H + STAGE_RISER;
export const TOP_SECT_Y = STAGE_BOT + 10;
export const TOP_SECT_H = TOP_ROWS * ROW_PITCH - (ROW_PITCH - S);
export const BOT_SECT_Y = TOP_SECT_Y + TOP_SECT_H + TOP_BOT_GAP;
export const BOT_SECT_H = BOT_ROWS * ROW_PITCH - (ROW_PITCH - S);
export const CANVAS_H   = BOT_SECT_Y + BOT_SECT_H + 60;

const topLeftType = (col) => {
  if (col >= 4) return 'VIP';
  if (col >= 1) return 'Premium';
  return 'Standard';
};
const topRightType = (col) => {
  if (col <= 3) return 'VIP';
  if (col <= 6) return 'Premium';
  return 'Standard';
};

const botLeftType = (row, col) => {
  if (col < 10) return 'Standard';
  if (row <= 2) return 'VIP';
  return 'Premium';
};

const botRightType = (row, col) => {
  if (col >= 15) return 'Standard';
  if (row <= 2) return 'VIP';
  return 'Premium';
};

export const buildSeats = (vi, vipPrice = 500000, premiumPrice = 250000, standardPrice = 150000) => {
  const list = [];
  const priceOf = { Standard: standardPrice, Premium: premiumPrice, VIP: vipPrice };
  const getColLetter = (index) => String.fromCharCode(65 + index);
  const push = (id, num, type, x, y) => {
    const { color, label } = ZONE[type];
    list.push({ id, num, type, zoneName: label(vi), price: priceOf[type], color, x, y });
  };

  for (let r = 0; r < TOP_ROWS; r++) {
    for (let c = 0; c < TOP_COLS; c++) {
      const x = TOP_LEFT_X + c * TOP_COL_PITCH;
      const y = TOP_SECT_Y + r * ROW_PITCH;
      
      let colLetter, type;
      if (c === 0) {
        colLetter = 'AA';
        type = 'Standard';
      } else if (c === 1) {
        colLetter = 'BB';
        type = 'Standard';
      } else {
        colLetter = getColLetter(c - 2);
        type = topLeftType(c - 2);
      }
      
      const rawNum = `${colLetter}${r + 1}`;
      const seatNum = `Khu 1 · ${rawNum}`;
      push(seatNum, seatNum, type, x, y);
    }
  }

  for (let r = 0; r < TOP_ROWS; r++) {
    for (let c = 0; c < TOP_COLS; c++) {
      const x = TOP_RIGHT_X + c * TOP_COL_PITCH;
      const y = TOP_SECT_Y + r * ROW_PITCH;
      
      let colLetter, type;
      if (c === TOP_COLS - 2) {
        colLetter = 'OO';
        type = 'Standard';
      } else if (c === TOP_COLS - 1) {
        colLetter = 'PP';
        type = 'Standard';
      } else {
        colLetter = getColLetter(8 + c); // Hardcoded offset 8 to preserve existing IDs
        type = topRightType(c);
      }
      
      const rawNum = `${colLetter}${r + 1}`;
      const seatNum = `Khu 2 · ${rawNum}`;
      push(seatNum, seatNum, type, x, y);
    }
  }

  for (let r = 0; r < BOT_ROWS; r++) {
    for (let c = 0; c < BOT_COLS; c++) {
      const x = BOT_LEFT_X + c * COL_PITCH;
      const y = BOT_SECT_Y + r * ROW_PITCH;
      const rowLetter = getColLetter(16 + r);
      const rawNum = `${rowLetter}${c + 1}`;
      const type = botLeftType(r, c);
      const seatNum = `Khu 3 · ${rawNum}`;
      push(seatNum, seatNum, type, x, y);
    }
  }

  for (let r = 0; r < BOT_ROWS; r++) {
    for (let c = 0; c < BOT_COLS; c++) {
      const x = BOT_RIGHT_X + c * COL_PITCH;
      const y = BOT_SECT_Y + r * ROW_PITCH;
      const rowLetter = getColLetter(16 + r);
      const rawNum = `${rowLetter}${25 + c + 1}`; // Hardcoded offset 25 (was BOT_COLS) to preserve existing IDs
      const type = botRightType(r, c);
      const seatNum = `Khu 4 · ${rawNum}`;
      push(seatNum, seatNum, type, x, y);
    }
  }

  return list;
};
