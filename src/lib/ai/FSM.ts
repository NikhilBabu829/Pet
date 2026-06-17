export const enum FsmState {
  IDLE = 'IDLE',
  WALKING = 'WALKING',
  RUNNING = 'RUNNING',
  SITTING = 'SITTING',
  SLEEPING = 'SLEEPING',
  PETTING = 'PETTING',
  TYPING = 'TYPING',
  OVERHEATING = 'OVERHEATING',
  MISCHIEF = 'MISCHIEF',
  POMO_WORK = 'POMO_WORK',
  POMO_BREAK = 'POMO_BREAK',
}

export const enum FsmEvent {
  // Autonomous / timer-driven
  WANDER = 'WANDER',
  ARRIVE = 'ARRIVE',
  SIT_DOWN = 'SIT_DOWN',
  FALL_ASLEEP = 'FALL_ASLEEP',
  WAKE_UP = 'WAKE_UP',

  // One-shot animation done
  ANIM_DONE = 'ANIM_DONE',

  // Input-driven
  PET = 'PET',
  SPEED_UP = 'SPEED_UP',
  SLOW_DOWN = 'SLOW_DOWN',

  // Keyboard/activity signals
  START_TYPING = 'START_TYPING',
  STOP_TYPING = 'STOP_TYPING',
  OVERHEAT = 'OVERHEAT',
  COOL_DOWN = 'COOL_DOWN',

  // Pomodoro signals
  POMO_WORK_START = 'POMO_WORK_START',
  POMO_BREAK_START = 'POMO_BREAK_START',
  POMO_END = 'POMO_END',

  // Mischief
  MISCHIEF_START = 'MISCHIEF_START',
  MISCHIEF_END = 'MISCHIEF_END',
}

const STATE_TO_ANIM: Record<FsmState, string> = {
  [FsmState.IDLE]: 'idle',
  [FsmState.WALKING]: 'walk',
  [FsmState.RUNNING]: 'run',
  [FsmState.SITTING]: 'sit',
  [FsmState.SLEEPING]: 'sleep',
  [FsmState.PETTING]: 'pet',
  [FsmState.TYPING]: 'type',
  [FsmState.OVERHEATING]: 'overheat',
  [FsmState.MISCHIEF]: 'mischief',
  [FsmState.POMO_WORK]: 'pomo_work',
  [FsmState.POMO_BREAK]: 'pomo_break',
};

function buildTransitionTable(): Map<FsmState, Map<FsmEvent, FsmState>> {
  const table = new Map<FsmState, Map<FsmEvent, FsmState>>();

  const add = (from: FsmState, event: FsmEvent, to: FsmState) => {
    if (!table.has(from)) table.set(from, new Map());
    table.get(from)!.set(event, to);
  };

  // IDLE transitions
  add(FsmState.IDLE, FsmEvent.WANDER, FsmState.WALKING);
  add(FsmState.IDLE, FsmEvent.SIT_DOWN, FsmState.SITTING);
  add(FsmState.IDLE, FsmEvent.FALL_ASLEEP, FsmState.SLEEPING);
  add(FsmState.IDLE, FsmEvent.PET, FsmState.PETTING);
  add(FsmState.IDLE, FsmEvent.SPEED_UP, FsmState.RUNNING);
  add(FsmState.IDLE, FsmEvent.START_TYPING, FsmState.TYPING);
  add(FsmState.IDLE, FsmEvent.OVERHEAT, FsmState.OVERHEATING);
  add(FsmState.IDLE, FsmEvent.POMO_WORK_START, FsmState.POMO_WORK);
  add(FsmState.IDLE, FsmEvent.POMO_BREAK_START, FsmState.POMO_BREAK);
  add(FsmState.IDLE, FsmEvent.MISCHIEF_START, FsmState.MISCHIEF);

  // WALKING transitions
  add(FsmState.WALKING, FsmEvent.ARRIVE, FsmState.IDLE);
  add(FsmState.WALKING, FsmEvent.PET, FsmState.PETTING);
  add(FsmState.WALKING, FsmEvent.SPEED_UP, FsmState.RUNNING);
  add(FsmState.WALKING, FsmEvent.START_TYPING, FsmState.TYPING);
  add(FsmState.WALKING, FsmEvent.OVERHEAT, FsmState.OVERHEATING);
  add(FsmState.WALKING, FsmEvent.POMO_WORK_START, FsmState.POMO_WORK);
  add(FsmState.WALKING, FsmEvent.POMO_BREAK_START, FsmState.POMO_BREAK);
  add(FsmState.WALKING, FsmEvent.MISCHIEF_START, FsmState.MISCHIEF);

  // RUNNING transitions
  add(FsmState.RUNNING, FsmEvent.SLOW_DOWN, FsmState.IDLE);
  add(FsmState.RUNNING, FsmEvent.ARRIVE, FsmState.IDLE);
  add(FsmState.RUNNING, FsmEvent.PET, FsmState.PETTING);
  add(FsmState.RUNNING, FsmEvent.POMO_WORK_START, FsmState.POMO_WORK);

  // SITTING transitions
  add(FsmState.SITTING, FsmEvent.WANDER, FsmState.WALKING);
  add(FsmState.SITTING, FsmEvent.FALL_ASLEEP, FsmState.SLEEPING);
  add(FsmState.SITTING, FsmEvent.PET, FsmState.PETTING);
  add(FsmState.SITTING, FsmEvent.WAKE_UP, FsmState.IDLE);
  add(FsmState.SITTING, FsmEvent.POMO_WORK_START, FsmState.POMO_WORK);
  add(FsmState.SITTING, FsmEvent.POMO_BREAK_START, FsmState.POMO_BREAK);

  // SLEEPING transitions
  add(FsmState.SLEEPING, FsmEvent.WAKE_UP, FsmState.IDLE);
  add(FsmState.SLEEPING, FsmEvent.PET, FsmState.PETTING);
  add(FsmState.SLEEPING, FsmEvent.START_TYPING, FsmState.TYPING);

  // PETTING transitions
  add(FsmState.PETTING, FsmEvent.ANIM_DONE, FsmState.IDLE);

  // TYPING transitions
  add(FsmState.TYPING, FsmEvent.STOP_TYPING, FsmState.IDLE);
  add(FsmState.TYPING, FsmEvent.OVERHEAT, FsmState.OVERHEATING);
  add(FsmState.TYPING, FsmEvent.POMO_WORK_START, FsmState.POMO_WORK);

  // OVERHEATING transitions
  add(FsmState.OVERHEATING, FsmEvent.COOL_DOWN, FsmState.IDLE);
  add(FsmState.OVERHEATING, FsmEvent.POMO_BREAK_START, FsmState.POMO_BREAK);

  // MISCHIEF transitions
  add(FsmState.MISCHIEF, FsmEvent.MISCHIEF_END, FsmState.IDLE);
  add(FsmState.MISCHIEF, FsmEvent.PET, FsmState.PETTING);

  // POMO_WORK transitions
  add(FsmState.POMO_WORK, FsmEvent.POMO_BREAK_START, FsmState.POMO_BREAK);
  add(FsmState.POMO_WORK, FsmEvent.POMO_END, FsmState.IDLE);
  add(FsmState.POMO_WORK, FsmEvent.OVERHEAT, FsmState.OVERHEATING);

  // POMO_BREAK transitions
  add(FsmState.POMO_BREAK, FsmEvent.POMO_WORK_START, FsmState.POMO_WORK);
  add(FsmState.POMO_BREAK, FsmEvent.POMO_END, FsmState.IDLE);
  add(FsmState.POMO_BREAK, FsmEvent.PET, FsmState.PETTING);

  return table;
}

export type FsmCallbacks = {
  onEnter?: (state: FsmState, from: FsmState) => void;
  onExit?: (state: FsmState, to: FsmState) => void;
};

export class FSM {
  private state: FsmState;
  private readonly callbacks: FsmCallbacks;
  private readonly table: ReadonlyMap<FsmState, ReadonlyMap<FsmEvent, FsmState>>;

  constructor(initial: FsmState = FsmState.IDLE, callbacks: FsmCallbacks = {}) {
    this.state = initial;
    this.callbacks = callbacks;
    this.table = buildTransitionTable();
  }

  get currentState(): FsmState {
    return this.state;
  }

  transition(event: FsmEvent): FsmState {
    const nextState = this.table.get(this.state)?.get(event);
    if (nextState === undefined) {
      throw new Error(`Illegal transition: ${this.state} --[${event}]--> ???`);
    }

    const from = this.state;
    this.callbacks.onExit?.(from, nextState);
    this.state = nextState;
    this.callbacks.onEnter?.(nextState, from);

    return nextState;
  }

  canTransition(event: FsmEvent): boolean {
    return (this.table.get(this.state)?.has(event) ?? false);
  }

  getAnimation(): string {
    return STATE_TO_ANIM[this.state];
  }
}
