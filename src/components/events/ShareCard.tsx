import type { CalendarEvent } from "../../types/event";
import { getEventDisciplines } from "../../types/event";
import { formatDate, formatTimeRange } from "../../utils/date";

// Inline badge colors matching the site's discipline palette
const badgeColors: Record<string, { bg: string; color: string }> = {
  Exhibition: { bg: "#f15bb5", color: "#ffffff" },
  Music: { bg: "#277da1", color: "#ffffff" },
  Theatre: { bg: "#e94f37", color: "#ffffff" },
  Film: { bg: "#24201c", color: "#fff7e8" },
  Dance: { bg: "#43aa8b", color: "#ffffff" },
  Poetry: { bg: "#7c3aed", color: "#ffffff" },
  Workshop: { bg: "#f9c74f", color: "#24201c" },
  Talk: { bg: "#f97316", color: "#ffffff" },
  Community: { bg: "#14b8a6", color: "#ffffff" },
  Multidisciplinary: { bg: "#a3e635", color: "#24201c" },
};

const COLORS = {
  ink: "#24201c",
  paper: "#fff7e8",
  yellow: "#f9c74f",
  red: "#e94f37",
};

const FONTS = {
  display: "'Fraunces', Georgia, serif",
  body: "'Inter', 'Atkinson Hyperlegible', Arial, sans-serif",
};

function titleFontSize(title: string): number {
  const len = title.length;
  if (len <= 22) return 56;
  if (len <= 35) return 48;
  if (len <= 50) return 40;
  if (len <= 65) return 32;
  return 26;
}

type ShareCardProps = {
  event: CalendarEvent;
};

export function ShareCard({ event }: ShareCardProps) {
  const disciplines = getEventDisciplines(event);
  const fontSize = titleFontSize(event.title);
  const ticketInfo = event.link_or_ticket_info ?? "";
  const showTicketInfo = ticketInfo.length > 0 && ticketInfo.length <= 55;

  return (
    <div
      style={{
        width: 540,
        height: 540,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: `4px solid ${COLORS.ink}`,
        boxSizing: "border-box",
        backgroundColor: COLORS.yellow,
        position: "relative",
      }}
    >
      {/* ── Header bar ── */}
      <div
        style={{
          backgroundColor: COLORS.ink,
          padding: "20px 26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          minHeight: 76,
          gap: 12,
        }}
      >
        <span
          style={{
            color: COLORS.yellow,
            fontFamily: FONTS.display,
            fontSize: 22,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}
        >
          Cork Culture
          <br />
          Board
        </span>
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            justifyContent: "flex-end",
            maxWidth: 260,
          }}
        >
          {disciplines.map((d) => {
            const c = badgeColors[d] ?? { bg: "#ffffff", color: COLORS.ink };
            return (
              <span
                key={d}
                style={{
                  backgroundColor: c.bg,
                  color: c.color,
                  fontFamily: FONTS.body,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: `2px solid ${COLORS.ink}`,
                  whiteSpace: "nowrap",
                }}
              >
                {d}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Main area (yellow) ── */}
      <div
        style={{
          flex: 1,
          padding: "24px 28px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          backgroundColor: COLORS.yellow,
          overflow: "hidden",
        }}
      >
        <p
          style={{
            color: COLORS.red,
            fontFamily: FONTS.body,
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          {formatDate(event.event_date)}&nbsp;&nbsp;·&nbsp;&nbsp;
          {formatTimeRange(event.start_time, event.end_time)}
        </p>
        <h1
          style={{
            color: COLORS.ink,
            fontFamily: FONTS.display,
            fontSize: fontSize,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            wordBreak: "break-word",
            margin: 0,
          }}
        >
          {event.title}
        </h1>
      </div>

      {/* ── Info strip (paper) ── */}
      <div
        style={{
          backgroundColor: COLORS.paper,
          borderTop: `3px solid ${COLORS.ink}`,
          padding: "16px 28px 14px",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            color: COLORS.ink,
            fontFamily: FONTS.body,
            fontSize: 15,
            fontWeight: 800,
            lineHeight: 1.3,
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {event.venue}
        </p>
        <p
          style={{
            color: "#57534e",
            fontFamily: FONTS.body,
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.3,
            margin: "4px 0 0",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {event.organiser}
        </p>
        {showTicketInfo ? (
          <p
            style={{
              color: "#78716c",
              fontFamily: FONTS.body,
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.3,
              margin: "4px 0 0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {ticketInfo}
          </p>
        ) : null}
        <div
          style={{
            marginTop: showTicketInfo ? 10 : 12,
            borderTop: `1px solid #d6d3d1`,
            paddingTop: 8,
          }}
        >
          <p
            style={{
              color: "#a8a29e",
              fontFamily: FONTS.body,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Cork Culture Board &nbsp;·&nbsp; By Cork Community Arts Union
          </p>
        </div>
      </div>
    </div>
  );
}
