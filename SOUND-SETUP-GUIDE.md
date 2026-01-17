# 🔊 Sound System Setup Guide

## Overview

The LioArcade platform now includes a comprehensive sound system with:
- **Sound Effects** for interactions (clicks, correct/incorrect answers, celebrations)
- **Background Music** (optional, can be enabled)
- **Volume Controls** for both effects and music
- **Sound Toggle** to enable/disable sounds

## Current Implementation

### Sound Effects (Generated via Web Audio API)

The system currently uses **Web Audio API** to generate simple sounds:
- ✅ **Click** - Button clicks, selections
- ✅ **Success** - Successful actions
- ✅ **Error** - Error messages
- ✅ **Celebration** - Score submissions
- ✅ **Level Up** - When user levels up
- ✅ **Correct** - Correct quiz/flashcard answers
- ✅ **Incorrect** - Incorrect answers
- ✅ **Character Run** - Character running animation
- ✅ **Character Point** - Character pointing animation
- ✅ **Page Transition** - Page navigation

### Where Sounds Are Used

1. **Interactive Character**
   - Running sound when moving to cards
   - Pointing sound when highlighting cards

2. **Quiz Interactions**
   - Click sound when selecting answers
   - Correct sound for right answers
   - Incorrect sound for wrong answers

3. **Flashcard Interactions**
   - Click sound when flipping cards
   - Correct sound for "I Know This"
   - Incorrect sound for "Don't Know"

4. **Score Submission**
   - Celebration sound on success
   - Level up sound when leveling up
   - Error sound on submission failure

5. **Sound Controls**
   - Click sound when toggling controls

## Sound Controls UI

A **sound control button** (🔊) appears in the **bottom-right corner** of all pages:
- Click to open/close sound settings
- Toggle sound effects on/off
- Toggle background music on/off
- Adjust volume sliders
- Test sound button

## Adding Real Sound Files (Optional)

To use actual sound files instead of generated sounds:

### Step 1: Add Sound Files

Create a `public/sounds/` directory and add your sound files:

```
public/
  sounds/
    click.mp3
    success.mp3
    error.mp3
    celebration.mp3
    level-up.mp3
    correct.mp3
    incorrect.mp3
    character-run.mp3
    character-point.mp3
    background-music.mp3
```

### Step 2: Update useSound Hook

Modify `frontend/src/hooks/useSound.ts`:

```typescript
// Replace generateSound function with:
const playSoundFile = (type: SoundType, volume: number = 0.7): void => {
  const soundMap: Record<SoundType, string> = {
    click: '/sounds/click.mp3',
    success: '/sounds/success.mp3',
    error: '/sounds/error.mp3',
    celebration: '/sounds/celebration.mp3',
    levelUp: '/sounds/level-up.mp3',
    correct: '/sounds/correct.mp3',
    incorrect: '/sounds/incorrect.mp3',
    characterRun: '/sounds/character-run.mp3',
    characterPoint: '/sounds/character-point.mp3',
    pageTransition: '/sounds/click.mp3',
  };

  const audio = new Audio(soundMap[type]);
  audio.volume = volume;
  audio.play().catch(console.warn);
};
```

### Step 3: Add Background Music

Uncomment and update the background music section in `useSound.ts`:

```typescript
useEffect(() => {
  if (typeof window !== 'undefined' && !backgroundMusicRef.current) {
    backgroundMusicRef.current = new Audio('/sounds/background-music.mp3');
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = config.backgroundMusicVolume;
  }
}, []);
```

## Recommended Sound Sources

For free, child-friendly sound effects:
- **Freesound.org** - Free sound effects (check licenses)
- **Zapsplat.com** - Free sound effects library
- **Pixabay** - Free music and sound effects
- **Incompetech** - Free background music

### Sound File Recommendations

- **Click**: Short, soft "pop" or "tap" sound
- **Correct**: Pleasant "ding" or "chime" (higher pitch)
- **Incorrect**: Gentle "buzz" or "whoosh" (lower pitch)
- **Celebration**: Cheerful "fanfare" or "success" sound
- **Level Up**: Triumphant "achievement" sound
- **Background Music**: Calm, upbeat instrumental music (loops seamlessly)

## Configuration

Sound preferences are saved in **localStorage**:
- `soundConfig` - Stores all sound settings
- Persists across page reloads
- User can adjust anytime via sound controls

## Browser Compatibility

- ✅ **Chrome/Edge**: Full support
- ✅ **Firefox**: Full support
- ✅ **Safari**: Full support (may require user interaction first)
- ⚠️ **Mobile**: Some browsers may restrict autoplay

## Future Enhancements

Potential improvements:
- [ ] Different sound themes (space, ocean, forest)
- [ ] Sound packs for different age groups
- [ ] Voice narration for instructions
- [ ] Adaptive volume based on time of day
- [ ] Sound effects for achievements/badges

## Testing

To test the sound system:
1. Click the 🔊 button in bottom-right
2. Click "Test Sound" button
3. Try interacting with quizzes/flashcards
4. Hover over category cards to hear character sounds
5. Submit a score to hear celebration sounds

---

**Note**: The current implementation uses Web Audio API to generate sounds, which works immediately without requiring sound files. For production, consider adding actual sound files for a richer experience!
