import { describe, it, expect } from 'vitest';
import { FSM, FsmState, FsmEvent } from './FSM';

describe('FSM', () => {
  describe('construction', () => {
    it('starts in the initial state passed to constructor', () => {
      const fsm = new FSM(FsmState.WALKING);
      expect(fsm.currentState).toBe(FsmState.WALKING);
    });

    it('defaults to IDLE when no initial state is given', () => {
      const fsm = new FSM();
      expect(fsm.currentState).toBe(FsmState.IDLE);
    });
  });

  describe('getAnimation()', () => {
    it('returns "idle" for IDLE state', () => {
      const fsm = new FSM(FsmState.IDLE);
      expect(fsm.getAnimation()).toBe('idle');
    });

    it('returns "walk" for WALKING state', () => {
      const fsm = new FSM(FsmState.WALKING);
      expect(fsm.getAnimation()).toBe('walk');
    });

    it('returns "pet" for PETTING state', () => {
      const fsm = new FSM(FsmState.PETTING);
      expect(fsm.getAnimation()).toBe('pet');
    });

    it('returns "type" for TYPING state', () => {
      const fsm = new FSM(FsmState.TYPING);
      expect(fsm.getAnimation()).toBe('type');
    });

    it('returns "overheat" for OVERHEATING state', () => {
      const fsm = new FSM(FsmState.OVERHEATING);
      expect(fsm.getAnimation()).toBe('overheat');
    });

    it('returns "mischief" for MISCHIEF state', () => {
      const fsm = new FSM(FsmState.MISCHIEF);
      expect(fsm.getAnimation()).toBe('mischief');
    });

    it('returns "pomo_work" for POMO_WORK state', () => {
      const fsm = new FSM(FsmState.POMO_WORK);
      expect(fsm.getAnimation()).toBe('pomo_work');
    });

    it('returns "pomo_break" for POMO_BREAK state', () => {
      const fsm = new FSM(FsmState.POMO_BREAK);
      expect(fsm.getAnimation()).toBe('pomo_break');
    });
  });

  describe('canTransition()', () => {
    it('returns true for a legal event in current state', () => {
      const fsm = new FSM(FsmState.IDLE);
      expect(fsm.canTransition(FsmEvent.WANDER)).toBe(true);
    });

    it('returns false for an illegal event in current state', () => {
      const fsm = new FSM(FsmState.IDLE);
      expect(fsm.canTransition(FsmEvent.ARRIVE)).toBe(false);
    });

    it('does not mutate state when called', () => {
      const fsm = new FSM(FsmState.IDLE);
      fsm.canTransition(FsmEvent.WANDER);
      expect(fsm.currentState).toBe(FsmState.IDLE);
    });
  });

  describe('legal transitions — autonomous', () => {
    it('IDLE --WANDER--> WALKING', () => {
      const fsm = new FSM(FsmState.IDLE);
      expect(fsm.transition(FsmEvent.WANDER)).toBe(FsmState.WALKING);
      expect(fsm.currentState).toBe(FsmState.WALKING);
    });

    it('IDLE --SIT_DOWN--> SITTING', () => {
      const fsm = new FSM(FsmState.IDLE);
      fsm.transition(FsmEvent.SIT_DOWN);
      expect(fsm.currentState).toBe(FsmState.SITTING);
    });

    it('IDLE --FALL_ASLEEP--> SLEEPING', () => {
      const fsm = new FSM(FsmState.IDLE);
      fsm.transition(FsmEvent.FALL_ASLEEP);
      expect(fsm.currentState).toBe(FsmState.SLEEPING);
    });

    it('WALKING --ARRIVE--> IDLE', () => {
      const fsm = new FSM(FsmState.WALKING);
      fsm.transition(FsmEvent.ARRIVE);
      expect(fsm.currentState).toBe(FsmState.IDLE);
    });

    it('SITTING --FALL_ASLEEP--> SLEEPING', () => {
      const fsm = new FSM(FsmState.SITTING);
      fsm.transition(FsmEvent.FALL_ASLEEP);
      expect(fsm.currentState).toBe(FsmState.SLEEPING);
    });

    it('SLEEPING --WAKE_UP--> IDLE', () => {
      const fsm = new FSM(FsmState.SLEEPING);
      fsm.transition(FsmEvent.WAKE_UP);
      expect(fsm.currentState).toBe(FsmState.IDLE);
    });
  });

  describe('legal transitions — input-driven', () => {
    it('IDLE --PET--> PETTING', () => {
      const fsm = new FSM(FsmState.IDLE);
      fsm.transition(FsmEvent.PET);
      expect(fsm.currentState).toBe(FsmState.PETTING);
    });

    it('PETTING --ANIM_DONE--> IDLE', () => {
      const fsm = new FSM(FsmState.PETTING);
      fsm.transition(FsmEvent.ANIM_DONE);
      expect(fsm.currentState).toBe(FsmState.IDLE);
    });

    it('WALKING --PET--> PETTING', () => {
      const fsm = new FSM(FsmState.WALKING);
      fsm.transition(FsmEvent.PET);
      expect(fsm.currentState).toBe(FsmState.PETTING);
    });

    it('IDLE --SPEED_UP--> RUNNING', () => {
      const fsm = new FSM(FsmState.IDLE);
      fsm.transition(FsmEvent.SPEED_UP);
      expect(fsm.currentState).toBe(FsmState.RUNNING);
    });

    it('RUNNING --SLOW_DOWN--> IDLE', () => {
      const fsm = new FSM(FsmState.RUNNING);
      fsm.transition(FsmEvent.SLOW_DOWN);
      expect(fsm.currentState).toBe(FsmState.IDLE);
    });
  });

  describe('legal transitions — pomodoro signals', () => {
    it('IDLE --POMO_WORK_START--> POMO_WORK', () => {
      const fsm = new FSM(FsmState.IDLE);
      fsm.transition(FsmEvent.POMO_WORK_START);
      expect(fsm.currentState).toBe(FsmState.POMO_WORK);
    });

    it('POMO_WORK --POMO_BREAK_START--> POMO_BREAK', () => {
      const fsm = new FSM(FsmState.POMO_WORK);
      fsm.transition(FsmEvent.POMO_BREAK_START);
      expect(fsm.currentState).toBe(FsmState.POMO_BREAK);
    });

    it('POMO_BREAK --POMO_END--> IDLE', () => {
      const fsm = new FSM(FsmState.POMO_BREAK);
      fsm.transition(FsmEvent.POMO_END);
      expect(fsm.currentState).toBe(FsmState.IDLE);
    });
  });

  describe('illegal transitions — throws', () => {
    it('throws when IDLE receives ANIM_DONE', () => {
      const fsm = new FSM(FsmState.IDLE);
      expect(() => fsm.transition(FsmEvent.ANIM_DONE)).toThrow(
        /Illegal transition.*IDLE.*ANIM_DONE/
      );
    });

    it('throws when PETTING receives WANDER', () => {
      const fsm = new FSM(FsmState.PETTING);
      expect(() => fsm.transition(FsmEvent.WANDER)).toThrow(
        /Illegal transition.*PETTING.*WANDER/
      );
    });

    it('throws when SLEEPING receives OVERHEAT', () => {
      const fsm = new FSM(FsmState.SLEEPING);
      expect(() => fsm.transition(FsmEvent.OVERHEAT)).toThrow(
        /Illegal transition.*SLEEPING.*OVERHEAT/
      );
    });

    it('throws when OVERHEATING receives WANDER', () => {
      const fsm = new FSM(FsmState.OVERHEATING);
      expect(() => fsm.transition(FsmEvent.WANDER)).toThrow(
        /Illegal transition.*OVERHEATING.*WANDER/
      );
    });

    it('throws when RUNNING receives FALL_ASLEEP', () => {
      const fsm = new FSM(FsmState.RUNNING);
      expect(() => fsm.transition(FsmEvent.FALL_ASLEEP)).toThrow(
        /Illegal transition.*RUNNING.*FALL_ASLEEP/
      );
    });

    it('throws when WALKING receives COOL_DOWN', () => {
      const fsm = new FSM(FsmState.WALKING);
      expect(() => fsm.transition(FsmEvent.COOL_DOWN)).toThrow(
        /Illegal transition.*WALKING.*COOL_DOWN/
      );
    });
  });

  describe('callbacks', () => {
    it('fires onExit with (fromState, toState) before state changes', () => {
      let exitCalled = false;
      let exitState: FsmState | null = null;
      let exitNextState: FsmState | null = null;

      const fsm = new FSM(FsmState.IDLE, {
        onExit: (state, to) => {
          exitCalled = true;
          exitState = state;
          exitNextState = to;
        },
      });

      fsm.transition(FsmEvent.WANDER);

      expect(exitCalled).toBe(true);
      expect(exitState).toBe(FsmState.IDLE);
      expect(exitNextState).toBe(FsmState.WALKING);
    });

    it('fires onEnter with (toState, fromState) after state changes', () => {
      let enterCalled = false;
      let enterState: FsmState | null = null;
      let enterFromState: FsmState | null = null;

      const fsm = new FSM(FsmState.IDLE, {
        onEnter: (state, from) => {
          enterCalled = true;
          enterState = state;
          enterFromState = from;
        },
      });

      fsm.transition(FsmEvent.WANDER);

      expect(enterCalled).toBe(true);
      expect(enterState).toBe(FsmState.WALKING);
      expect(enterFromState).toBe(FsmState.IDLE);
    });

    it('fires onExit before onEnter — order guarantee', () => {
      const order: string[] = [];

      const fsm = new FSM(FsmState.IDLE, {
        onExit: () => order.push('exit'),
        onEnter: () => order.push('enter'),
      });

      fsm.transition(FsmEvent.WANDER);

      expect(order).toEqual(['exit', 'enter']);
    });

    it('still transitions correctly when no callbacks are provided', () => {
      const fsm = new FSM(FsmState.IDLE);
      fsm.transition(FsmEvent.WANDER);
      expect(fsm.currentState).toBe(FsmState.WALKING);
    });

    it('transition return value equals the new state', () => {
      const fsm = new FSM(FsmState.IDLE);
      const result = fsm.transition(FsmEvent.WANDER);
      expect(result).toBe(FsmState.WALKING);
    });
  });

  describe('multi-step sequences', () => {
    it('IDLE → WALKING → IDLE (wander + arrive cycle)', () => {
      const fsm = new FSM(FsmState.IDLE);
      fsm.transition(FsmEvent.WANDER);
      expect(fsm.currentState).toBe(FsmState.WALKING);
      fsm.transition(FsmEvent.ARRIVE);
      expect(fsm.currentState).toBe(FsmState.IDLE);
    });

    it('IDLE → PETTING → IDLE (one-shot complete)', () => {
      const fsm = new FSM(FsmState.IDLE);
      fsm.transition(FsmEvent.PET);
      expect(fsm.currentState).toBe(FsmState.PETTING);
      fsm.transition(FsmEvent.ANIM_DONE);
      expect(fsm.currentState).toBe(FsmState.IDLE);
    });

    it('IDLE → TYPING → OVERHEATING → IDLE (keyboard escalation)', () => {
      const fsm = new FSM(FsmState.IDLE);
      fsm.transition(FsmEvent.START_TYPING);
      expect(fsm.currentState).toBe(FsmState.TYPING);
      fsm.transition(FsmEvent.OVERHEAT);
      expect(fsm.currentState).toBe(FsmState.OVERHEATING);
      fsm.transition(FsmEvent.COOL_DOWN);
      expect(fsm.currentState).toBe(FsmState.IDLE);
    });

    it('full pomodoro round: IDLE → WORK → BREAK → IDLE', () => {
      const fsm = new FSM(FsmState.IDLE);
      fsm.transition(FsmEvent.POMO_WORK_START);
      expect(fsm.currentState).toBe(FsmState.POMO_WORK);
      fsm.transition(FsmEvent.POMO_BREAK_START);
      expect(fsm.currentState).toBe(FsmState.POMO_BREAK);
      fsm.transition(FsmEvent.POMO_END);
      expect(fsm.currentState).toBe(FsmState.IDLE);
    });
  });
});
