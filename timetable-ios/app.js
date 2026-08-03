const app = document.querySelector("#app");
const tabs = document.querySelector("#screenTabs");

const layout = {
  leftAxis: 57,
  boardWidth: 321,
  columnGap: 1,
  columnWidth: (321 - 6) / 7,
  boardHeight: 603,
};

const segments = [
  { start: "08:00", end: "08:45", height: 47, kind: "slot", slot: 1 },
  { start: "08:45", end: "08:50", height: 1, kind: "denseGap" },
  { start: "08:50", end: "09:35", height: 47, kind: "slot", slot: 2 },
  { start: "09:35", end: "10:05", height: 1, kind: "denseGap" },
  { start: "10:05", end: "10:50", height: 47, kind: "slot", slot: 3 },
  { start: "10:50", end: "10:55", height: 1, kind: "denseGap" },
  { start: "10:55", end: "11:40", height: 47, kind: "slot", slot: 4 },
  { start: "11:40", end: "13:30", height: 15, kind: "isolatedGap" },
  { start: "13:30", end: "14:15", height: 47, kind: "slot", slot: 5 },
  { start: "14:15", end: "14:20", height: 1, kind: "denseGap" },
  { start: "14:20", end: "15:05", height: 47, kind: "slot", slot: 6 },
  { start: "15:05", end: "15:35", height: 1, kind: "denseGap" },
  { start: "15:35", end: "16:20", height: 47, kind: "slot", slot: 7 },
  { start: "16:20", end: "16:25", height: 1, kind: "denseGap" },
  { start: "16:25", end: "17:10", height: 47, kind: "slot", slot: 8 },
  { start: "17:10", end: "18:00", height: 15, kind: "isolatedGap" },
  { start: "18:00", end: "18:45", height: 47, kind: "slot", slot: 9 },
  { start: "18:45", end: "18:55", height: 1, kind: "denseGap" },
  { start: "18:55", end: "19:40", height: 47, kind: "slot", slot: 10 },
  { start: "19:40", end: "19:50", height: 1, kind: "denseGap" },
  { start: "19:50", end: "20:35", height: 47, kind: "slot", slot: 11 },
  { start: "20:35", end: "20:45", height: 1, kind: "denseGap" },
  { start: "20:45", end: "21:30", height: 47, kind: "slot", slot: 12 },
];

const sourceCourses = [
  {
    id: "B0B53F65-E792-4EC2-9D67-9F06DBA6A001",
    name: "思想政治",
    location: "第二教学楼",
    classroom: "3-315",
    teacher: "陈老师",
    weekday: 1,
    startSlot: 1,
    endSlot: 2,
    weeks: range(1, 16),
    weekPattern: "every",
    tasks: ["建模初稿提交", "改方案", "草图提交"],
  },
  {
    id: "B0B53F65-E792-4EC2-9D67-9F06DBA6A002",
    name: "视觉设计",
    location: "艺术楼",
    classroom: "A-201",
    teacher: "李老师",
    weekday: 2,
    startSlot: 1,
    endSlot: 4,
    weeks: range(1, 16),
    weekPattern: "every",
    tasks: [],
  },
  {
    id: "B0B53F65-E792-4EC2-9D67-9F06DBA6A003",
    name: "高等数学",
    location: "",
    classroom: "B-208",
    teacher: "王老师",
    weekday: 3,
    startSlot: 1,
    endSlot: 2,
    weeks: range(1, 16),
    weekPattern: "every",
    tasks: ["作业第三章"],
  },
];

const sourceEvents = [
  {
    id: "C1C64A1E-5C10-4A5F-8A3D-5F88E5C1A001",
    title: "打卡",
    location: "",
    date: "2026-06-10T00:00:00Z",
    startTime: "10:05",
    endTime: "11:40",
    repeatRule: "none",
    weeks: [15],
    notes: "",
  },
  {
    id: "C1C64A1E-5C10-4A5F-8A3D-5F88E5C1A002",
    title: "晨会",
    location: "第二教学馆305",
    date: "2026-06-09T00:00:00Z",
    startTime: "09:30",
    endTime: "10:30",
    repeatRule: "weekly",
    weeks: range(15, 20),
    notes: "",
  },
  {
    id: "C1C64A1E-5C10-4A5F-8A3D-5F88E5C1A003",
    title: "午餐聚会",
    location: "",
    date: "2026-06-12T00:00:00Z",
    startTime: "12:00",
    endTime: "13:00",
    repeatRule: "none",
    weeks: [15],
    notes: "记得提前到场",
  },
];

const state = {
  screen: "schedule",
  mode: "courses",
  selectedWeek: 15,
  courses: sourceCourses.map((course) => ({ ...course })),
  events: sourceEvents.map((event) => ({ ...event })),
  flippedCourseId: null,
  overlay: null,
};

const weekDays = [
  { weekday: "MON", day: 8 },
  { weekday: "TUE", day: 9 },
  { weekday: "WED", day: 10, isToday: true },
  { weekday: "THU", day: 11 },
  { weekday: "FRI", day: 12 },
  { weekday: "SAT", day: 13 },
  { weekday: "SUN", day: 14 },
];

tabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-screen]");
  if (!button) return;
  setScreen(button.dataset.screen);
});

function setScreen(screen) {
  state.screen = screen;
  state.overlay = null;
  state.flippedCourseId = null;
  state.mode = screen === "events" ? "events" : "courses";
  render();
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrapChinese(text, chars = 3, maxLines = 2) {
  const charsArray = Array.from(String(text || "未命名"));
  const clipped = charsArray.slice(0, chars * maxLines);
  const lines = [];
  for (let i = 0; i < clipped.length; i += chars) {
    lines.push(clipped.slice(i, i + chars).join(""));
  }
  return lines.join("\n");
}

function weekdayOfEvent(event) {
  const day = new Date(event.date).getUTCDay();
  return day === 0 ? 7 : day;
}

function minutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function yForTime(time) {
  const target = minutes(time);
  let y = 0;
  for (const segment of segments) {
    const start = minutes(segment.start);
    const end = minutes(segment.end);
    if (target <= start) return y;
    if (target < end) {
      return y + ((target - start) / (end - start)) * segment.height;
    }
    y += segment.height;
  }
  return y;
}

function slotPosition(startSlot, endSlot) {
  const slots = segments.filter((segment) => segment.kind === "slot");
  const start = slots.find((segment) => segment.slot === startSlot);
  const end = slots.find((segment) => segment.slot === endSlot);
  return {
    y: yForTime(start?.start || "08:00"),
    height: yForTime(end?.end || start?.end || "08:45") - yForTime(start?.start || "08:00"),
  };
}

function xForWeekday(weekday) {
  return (weekday - 1) * (layout.columnWidth + layout.columnGap);
}

function setTabState() {
  tabs.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === state.screen);
  });
}

function render() {
  setTabState();
  if (state.screen === "select") {
    app.innerHTML = renderSelectFirstWeek();
  } else if (state.screen === "preview") {
    app.innerHTML = renderSemesterPreview();
  } else if (state.screen === "course-form") {
    app.innerHTML = renderCourseForm();
  } else if (state.screen === "blank") {
    app.innerHTML = renderScheduleShell({ blank: true });
  } else {
    app.innerHTML = renderScheduleShell({ blank: false });
  }
  bindAppEvents();
}

function renderHeader(variant, title = "") {
  const titleMap = {
    weeknumber: title || `第${state.selectedWeek}周`,
    buildnewsheet: "点击左侧新建课表",
    choosethefirstweek: "选择学期第一周",
    preview: "学期预览",
    newschedule: title || "新建课程",
  };
  const leftClass = variant === "weeknumber" || variant === "buildnewsheet" ? "calendar" : variant === "newschedule" ? "quit" : "back";
  const rightClass = variant === "weeknumber" ? "plus" : variant === "preview" || variant === "newschedule" ? "confirm" : "";
  const right = rightClass
    ? `<button class="icon-btn ${rightClass}" data-action="${variant === "weeknumber" ? "new-course" : "confirm"}" aria-label="确认"><span></span></button>`
    : `<span></span>`;
  return `
    <header class="top-header">
      <button class="icon-btn ${leftClass}" data-action="${leftClass === "calendar" ? "select-week" : "back"}" aria-label="返回或新建课表"><span></span></button>
      <div class="top-title">${escapeHTML(titleMap[variant])}</div>
      ${right}
    </header>
  `;
}

function renderWeekDateBar() {
  return `
    <section class="week-date-bar" aria-label="周日期">
      <div class="month-label">六<br>月</div>
      <div class="date-row">
        ${weekDays.map((day) => `
          <div class="date-cell ${day.isToday ? "is-today" : ""}">
            <div><span>${day.weekday}</span><strong>${day.day}</strong></div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderScheduleShell({ blank }) {
  const variant = blank ? "buildnewsheet" : "weeknumber";
  const mode = blank ? "courses" : state.mode;
  return `
    ${renderHeader(variant, `第${state.selectedWeek}周`)}
    ${renderWeekDateBar()}
    <section class="schedule-area">
      ${renderTimeAxis()}
      <div class="board">
        ${renderGrid()}
        ${blank ? "" : renderCourses(mode)}
        ${blank ? "" : renderEvents(mode)}
      </div>
      ${state.selectedWeek < 1 || state.selectedWeek > 20 ? `<div class="outside-message">学期范围外</div>` : ""}
      ${renderBottomToggle(mode, blank)}
    </section>
    ${renderOverlay()}
  `;
}

function renderTimeAxis() {
  return `
    <div class="time-axis" aria-hidden="true">
      ${segments.filter((segment) => segment.kind === "slot").map((segment) => `
        <div class="time-label" style="top:${yForTime(segment.start)}px">
          <span>${segment.start}</span><strong>${segment.slot}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function renderGrid() {
  return segments.filter((segment) => segment.kind === "slot").flatMap((segment) => {
    const y = yForTime(segment.start);
    return range(1, 7).map((weekday) => (
      `<div class="slot" style="left:${xForWeekday(weekday)}px;top:${y}px"></div>`
    ));
  }).join("");
}

function renderCourses(mode) {
  return state.courses
    .filter((course) => course.weeks.includes(state.selectedWeek))
    .map((course) => {
      const position = slotPosition(course.startSlot, course.endSlot);
      const flipped = state.flippedCourseId === course.id;
      const location = [course.location, course.classroom].filter(Boolean).join("\n");
      const taskLines = course.tasks.length ? course.tasks.slice(0, 4).map((task) => wrapChinese(task, 3, 1)).join("\n") : "暂无";
      return `
        <button class="course-card ${flipped ? "flipped" : ""} ${mode === "events" ? "dimmed" : ""}"
          data-action="flip-course"
          data-course-id="${course.id}"
          style="left:${xForWeekday(course.weekday)}px;top:${position.y}px;height:${position.height}px">
          <span class="course-inner">
            <span class="course-title">${escapeHTML(flipped ? taskLines : wrapChinese(course.name))}</span>
            ${flipped ? "" : `<span class="course-meta">${escapeHTML(wrapChinese(location, 3, 2))}</span>`}
          </span>
          ${!flipped && course.tasks.length ? `<span class="task-dot"></span>` : ""}
        </button>
      `;
    })
    .join("");
}

function renderEvents(mode) {
  return state.events
    .filter((event) => event.weeks.includes(state.selectedWeek))
    .map((event) => {
      const y = yForTime(event.startTime);
      const height = Math.max(28, yForTime(event.endTime) - y);
      const weekday = weekdayOfEvent(event);
      return `
        <button class="event-card ${mode === "events" ? "active" : "ghost"}"
          data-action="event-detail"
          data-event-id="${event.id}"
          style="left:${xForWeekday(weekday)}px;top:${y}px;height:${height}px">
          <div>
            <small>${event.startTime}</small>
            <strong>${escapeHTML(event.title)}</strong>
            <small>${event.endTime}</small>
          </div>
        </button>
      `;
    })
    .join("");
}

function renderBottomToggle(mode, blank) {
  return `
    <button class="bottom-toggle ${mode === "events" ? "events" : ""}" data-action="toggle-mode">
      ${mode === "events" ? "切换到课程" : "切换到事项"}
    </button>
    ${mode === "events" && !blank ? `<button class="floating-plus" data-action="new-event" aria-label="新建事项"><span></span></button>` : ""}
  `;
}

function renderSelectFirstWeek() {
  return `
    ${renderHeader("choosethefirstweek")}
    <div class="week-header-row">
      <span></span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
    </div>
    <section class="week-list">
      ${range(8, 24).map((startDay, index) => renderWeekRow({ index, startDay, current: startDay === 8, preview: false })).join("")}
    </section>
  `;
}

function renderSemesterPreview() {
  return `
    ${renderHeader("preview")}
    <div class="week-header-row">
      <span></span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
    </div>
    <section class="week-list">
      ${range(1, 16).map((week, index) => renderWeekRow({ index, startDay: 1 + index * 7, current: week === 15, preview: true, week })).join("")}
    </section>
  `;
}

function renderWeekRow({ index, startDay, current, preview, week }) {
  const days = range(0, 6).map((offset) => ((startDay + offset - 1) % 30) + 1);
  const title = preview ? `第${week}周` : current ? "本周" : "";
  return `
    <button class="week-row ${current ? "current" : ""} ${preview ? "preview-week" : ""}" data-action="${preview ? "none" : "choose-week"}" data-week="${index + 8}">
      <span class="week-row-title">${escapeHTML(title)}</span>
      ${days.map((day) => `<span class="week-day">${day}</span>`).join("")}
    </button>
  `;
}

function renderCourseForm() {
  return `
    ${renderHeader("newschedule", "新建课程")}
    <section class="form-body">
      <div class="form-grid">
        <div class="form-row"><label for="courseName">课程名称</label><input id="courseName" value="用户研究"></div>
        <div class="form-row"><label for="coursePlace">上课地点</label><input id="coursePlace" value="设计楼 B-206"></div>
        <div class="form-row"><label for="courseTeacher">授课教师</label><input id="courseTeacher" value="赵老师"></div>
        <div class="form-row"><label for="courseDay">星期</label><select id="courseDay">${range(1, 7).map((day) => `<option value="${day}" ${day === 4 ? "selected" : ""}>周${"一二三四五六日"[day - 1]}</option>`).join("")}</select></div>
        <div class="form-row"><label for="courseStart">开始节次</label><select id="courseStart">${range(1, 12).map((slot) => `<option value="${slot}" ${slot === 5 ? "selected" : ""}>第${slot}节</option>`).join("")}</select></div>
        <div class="form-row"><label for="courseEnd">结束节次</label><select id="courseEnd">${range(1, 12).map((slot) => `<option value="${slot}" ${slot === 6 ? "selected" : ""}>第${slot}节</option>`).join("")}</select></div>
      </div>
      <p class="sheet-caption">保存后会回到第十五周正式课表，并把这门课程放到对应星期和节次。</p>
    </section>
    ${renderOverlay()}
  `;
}

function renderOverlay() {
  if (!state.overlay) return "";
  if (state.overlay.type === "course-detail") {
    const course = state.courses.find((item) => item.id === state.overlay.id);
    if (!course) return "";
    return `
      <div class="popover-scrim" data-action="dismiss">
        <div class="detail-popover" role="dialog" aria-label="课程详情">
          <div class="detail-row">${escapeHTML(course.name || "未命名课程")}</div>
          <div class="detail-row">${escapeHTML([course.location, course.classroom].filter(Boolean).join("") || "未明确地点")}</div>
          <div class="detail-row">${escapeHTML(formatWeeks(course))}</div>
          <div class="detail-row">周${"一二三四五六日"[course.weekday - 1]} | ${course.startSlot}-${course.endSlot}节</div>
          <div class="detail-row">${escapeHTML(course.teacher || "授课教师")}</div>
          <div class="detail-row actions"><button data-action="delete-course" data-course-id="${course.id}">删除</button><button data-action="edit-course">编辑</button></div>
        </div>
      </div>
    `;
  }
  if (state.overlay.type === "event-detail") {
    const event = state.events.find((item) => item.id === state.overlay.id);
    if (!event) return "";
    return `
      <div class="popover-scrim" data-action="dismiss">
        <div class="detail-popover" role="dialog" aria-label="事项详情">
          <div class="detail-row">${escapeHTML(event.title || "未命名事项")}</div>
          <div class="detail-row">${escapeHTML(event.location || "未填写")}</div>
          <div class="detail-row">6月${weekDays[weekdayOfEvent(event) - 1].day}日 | 周${"一二三四五六日"[weekdayOfEvent(event) - 1]}</div>
          <div class="detail-row">${event.startTime.replace(":", "：")}-${event.endTime.replace(":", "：")}</div>
          <div class="detail-row">${escapeHTML(event.notes ? `事项备注：${event.notes}` : "未填写")}</div>
          <div class="detail-row actions"><button data-action="delete-event" data-event-id="${event.id}">删除</button><button data-action="edit-event">编辑</button></div>
        </div>
      </div>
    `;
  }
  if (state.overlay.type === "task-list") {
    const course = state.courses.find((item) => item.id === state.overlay.id);
    if (!course) return "";
    return `
      <div class="popover-scrim" data-action="dismiss">
        <div class="task-popover" role="dialog" aria-label="课程任务">
          <div class="task-list">
            ${(course.tasks.length ? course.tasks : ["暂无"]).map((task) => `<div class="task-row">${escapeHTML(task)}</div>`).join("")}
          </div>
          <div class="task-add">＋ 添加任务</div>
        </div>
      </div>
    `;
  }
  if (state.overlay.type === "warning") {
    return `
      <div class="popover-scrim" data-action="dismiss">
        <div class="warning-popover" role="dialog" aria-label="删除确认">
          <p>${escapeHTML(state.overlay.message)}</p>
          <div class="warning-actions">
            <button data-action="dismiss">取消</button>
            <button data-action="confirm-delete">确认</button>
          </div>
        </div>
      </div>
    `;
  }
  return "";
}

function formatWeeks(course) {
  const weeks = course.weeks || [];
  if (!weeks.length) return `第${state.selectedWeek}周`;
  return `${weeks[0]}-${weeks[weeks.length - 1]}周${course.weekPattern === "odd" ? " | 单周" : course.weekPattern === "even" ? " | 双周" : ""}`;
}

function bindAppEvents() {
  app.querySelectorAll("[data-action]").forEach((node) => {
    node.addEventListener("click", handleAction);
  });
  app.querySelectorAll(".course-card").forEach((node) => {
    let pressTimer = 0;
    node.addEventListener("dblclick", (event) => {
      event.preventDefault();
      state.overlay = { type: "course-detail", id: node.dataset.courseId };
      render();
    });
    node.addEventListener("pointerdown", () => {
      pressTimer = window.setTimeout(() => {
        state.overlay = state.flippedCourseId === node.dataset.courseId
          ? { type: "task-list", id: node.dataset.courseId }
          : { type: "course-detail", id: node.dataset.courseId };
        render();
      }, 520);
    });
    node.addEventListener("pointerup", () => window.clearTimeout(pressTimer));
    node.addEventListener("pointerleave", () => window.clearTimeout(pressTimer));
  });
}

function handleAction(event) {
  event.stopPropagation();
  const target = event.currentTarget;
  const action = target.dataset.action;
  if (action === "none") return;
  if (action === "select-week") {
    state.screen = "select";
  } else if (action === "back") {
    state.screen = "schedule";
  } else if (action === "confirm") {
    if (state.screen === "course-form") {
      saveCourseFromForm();
    } else {
      state.screen = "schedule";
    }
  } else if (action === "new-course" || action === "edit-course") {
    state.screen = "course-form";
  } else if (action === "new-event") {
    state.events.push({
      id: `event-${Date.now()}`,
      title: "工作坊",
      location: "创新空间",
      date: "2026-06-11T00:00:00Z",
      startTime: "15:35",
      endTime: "17:10",
      repeatRule: "none",
      weeks: [state.selectedWeek],
      notes: "带电脑",
    });
    state.mode = "events";
  } else if (action === "toggle-mode") {
    state.mode = state.mode === "courses" ? "events" : "courses";
    state.screen = state.mode === "events" ? "events" : "schedule";
  } else if (action === "flip-course") {
    state.flippedCourseId = state.flippedCourseId === target.dataset.courseId ? null : target.dataset.courseId;
  } else if (action === "event-detail") {
    if (state.mode === "events") state.overlay = { type: "event-detail", id: target.dataset.eventId };
  } else if (action === "choose-week") {
    state.selectedWeek = 15;
    state.screen = "preview";
  } else if (action === "dismiss") {
    state.overlay = null;
  } else if (action === "delete-course") {
    state.overlay = { type: "warning", targetType: "course", id: target.dataset.courseId, message: "选择删除本周或全学周此课程" };
  } else if (action === "delete-event") {
    state.overlay = { type: "warning", targetType: "event", id: target.dataset.eventId, message: "确认删除此事项？" };
  } else if (action === "confirm-delete") {
    if (state.overlay?.targetType === "course") {
      state.courses = state.courses.filter((course) => course.id !== state.overlay.id);
    }
    if (state.overlay?.targetType === "event") {
      state.events = state.events.filter((event) => event.id !== state.overlay.id);
    }
    state.overlay = null;
  }
  render();
}

function saveCourseFromForm() {
  const name = document.querySelector("#courseName")?.value || "新课程";
  const place = document.querySelector("#coursePlace")?.value || "";
  const teacher = document.querySelector("#courseTeacher")?.value || "";
  const weekday = Number(document.querySelector("#courseDay")?.value || 1);
  const startSlot = Number(document.querySelector("#courseStart")?.value || 1);
  const endSlot = Math.max(startSlot, Number(document.querySelector("#courseEnd")?.value || startSlot));
  const parts = place.split(/\s+/);
  state.courses.push({
    id: `course-${Date.now()}`,
    name,
    location: parts.length > 1 ? parts.slice(0, -1).join(" ") : "",
    classroom: parts.at(-1) || place,
    teacher,
    weekday,
    startSlot,
    endSlot,
    weeks: range(1, 16),
    weekPattern: "every",
    tasks: ["新任务"],
  });
  state.screen = "schedule";
  state.mode = "courses";
}

render();
