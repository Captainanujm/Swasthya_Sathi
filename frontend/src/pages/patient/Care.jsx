import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/providers/AuthProvider';
import { patientService } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Bell, 
  Clock, 
  Calendar, 
  Pill, 
  MoreVertical, 
  Plus, 
  CheckCircle, 
  AlarmClock, 
  Edit2, 
  Trash2,
  ToggleLeft,
  ToggleRight 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Switch
} from '@/components/ui/switch';

// Days of the week for checkboxes
const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

// Format time from 24h to 12h format
const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
};

// Function to get today's day name
const getTodayDayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

// Helper to check if a time is within the check window of the current time
const isTimeMatching = (reminderTime, currentTime) => {
  console.log(`Comparing reminder time: ${reminderTime} with current time: ${currentTime}`);
  
  // Direct string comparison first (exact match)
  if (reminderTime === currentTime) {
    console.log('Exact time match!');
    return true;
  }
  
  // Parse the hours and minutes
  const [reminderHours, reminderMinutes] = reminderTime.split(':').map(Number);
  const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
  
  // Convert to minutes since midnight for easier comparison
  const reminderMinutesSinceMidnight = (reminderHours * 60) + reminderMinutes;
  const currentMinutesSinceMidnight = (currentHours * 60) + currentMinutes;
  
  // Calculate absolute difference in minutes
  const minuteDifference = Math.abs(reminderMinutesSinceMidnight - currentMinutesSinceMidnight);
  console.log(`Time difference: ${minuteDifference} minutes`);
  
  // Check if the times are within 2 minutes of each other
  // This is to ensure we don't miss alarms if the check interval happens to skip
  // the exact minute
  const isMatching = minuteDifference <= 2;
  
  if (isMatching) {
    console.log('Time matches within ±2 minutes window!');
  }
  
  return isMatching;
};

const Care = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReminder, setCurrentReminder] = useState(null);
  const [alarmState, setAlarmState] = useState({});
  const [audioElement, setAudioElement] = useState(null);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  
  // Form state
  const [reminderForm, setReminderForm] = useState({
    medicationName: '',
    dosage: '',
    time: '08:00',
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    notes: '',
    isActive: true
  });
  
  // Initialize audio element
  useEffect(() => {
    // Create multiple audio elements to improve chances of one working
    try {
      // Create main audio element
      const audio = new Audio('/sounds/alarm.mp3');
      audio.preload = 'auto';
      audio.volume = 1.0;
      
      // Add event listeners for debugging
      audio.addEventListener('canplaythrough', () => {
        console.log('Audio can play through, it is loaded and ready');
      });
      
      const handleError = (e) => {
        console.error('Main audio error:', e);
        console.error('Audio error code:', audio.error ? audio.error.code : 'unknown');
        
        // Create a fallback with absolute URL
        const fallbackAudio = new Audio(`${window.location.origin}/sounds/alarm.mp3`);
        fallbackAudio.play().catch(err => console.error('Fallback audio failed:', err));
      };
      
      audio.addEventListener('error', handleError);
      
      // Test if audio can play
      console.log('Setting up audio element and testing playback');
      
      // Try to load the audio
      audio.load();
      
      setAudioElement(audio);
      
      // Try playing a silent version as a test
      const silentTestAudio = new Audio('/sounds/alarm.mp3');
      silentTestAudio.volume = 0.01; // Very quiet
      silentTestAudio.play()
        .then(() => {
          console.log('Successfully played test audio');
          silentTestAudio.pause();
          silentTestAudio.currentTime = 0;
        })
        .catch(err => {
          console.log('Test audio failed, might need user interaction:', err);
        });
    } catch (err) {
      console.error('Error setting up audio:', err);
    }
    
    // Request notification permission immediately
    if ('Notification' in window) {
      console.log('Notification API is available');
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        console.log('Requesting notification permission');
        Notification.requestPermission().then(permission => {
          console.log('Notification permission response:', permission);
        });
      } else {
        console.log('Current notification permission:', Notification.permission);
      }
    } else {
      console.warn('Notifications not supported in this browser');
    }
    
    return () => {
      // Cleanup
      if (audioElement) {
        audioElement.removeEventListener('error', handleError);
      }
    };
  }, []); // Empty dependency array means this runs once on mount
  
  useEffect(() => {
    // Fetch reminders when component mounts
    fetchReminders();
    
    // Set up notification check interval - check more frequently (every 5 seconds)
    const notificationInterval = setInterval(checkForDueReminders, 5000);
    console.log('Setting up notification check interval (every 5 seconds)');
    
    // Also set an immediate check for reminders
    const initialCheck = setTimeout(() => {
      console.log('Running initial reminder check');
      checkForDueReminders();
    }, 1000);
    
    // Create click handler to enable audio after user interaction
    const handleUserInteraction = () => {
      console.log('User interaction detected - attempting to unlock audio');
      
      // Create and play a silent audio to unlock audio capabilities
      const unlockAudio = new Audio('/sounds/alarm.mp3');
      unlockAudio.volume = 0.01; // Very low volume
      unlockAudio.play()
        .then(() => {
          console.log('Audio unlocked by user interaction');
          unlockAudio.pause();
          unlockAudio.currentTime = 0;
        })
        .catch(err => {
          console.log('Failed to unlock audio:', err);
        });
    };
    
    // Add the interaction handler to unlock audio
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    
    return () => {
      clearInterval(notificationInterval);
      clearTimeout(initialCheck);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []); // Empty dependency array for component mount only
  
  // Set up a timer to update the current time every second
  useEffect(() => {
    // Update current time immediately
    updateCurrentTime();
    
    // Update it every second instead of every minute for a ticking seconds display
    const timer = setInterval(updateCurrentTime, 1000);
    
    return () => clearInterval(timer);
  }, []); // Empty dependency array means this runs once on mount
  
  // Effect to update upcoming reminders when reminders list changes
  useEffect(() => {
    findUpcomingReminders();
  }, [reminders]); // Dependency on reminders
  
  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await patientService.getMedicationReminders();
      setReminders(response.data.data.reminders);
      
      // After fetching reminders, update the upcoming reminders list
      setTimeout(() => {
        findUpcomingReminders();
      }, 100);
    } catch (error) {
      console.error('Error fetching medication reminders:', error);
      toast.error('Failed to load medication reminders');
    } finally {
      setLoading(false);
    }
  };
  
  const checkForDueReminders = () => {
    // Update the current time when checking for reminders
    updateCurrentTime();
    
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    const currentDay = getTodayDayName();
    
    console.log(`Checking reminders at ${currentTime} on ${currentDay}`);
    
    // Skip if no reminders
    if (!reminders || reminders.length === 0) {
      console.log('No reminders to check');
      return;
    }
    
    // Find reminders that are due
    let foundDueReminder = false;
    
    reminders.forEach(reminder => {
      if (!reminder.isActive) {
        console.log(`Reminder ${reminder.medicationName} is not active, skipping`);
        return;
      }
      
      // Check if the reminder is for today
      if (!reminder.daysOfWeek.includes(currentDay)) {
        console.log(`Reminder ${reminder.medicationName} is not scheduled for today (${currentDay}), skipping`);
        return;
      }
      
      // The reminder time in HH:MM format
      const reminderTime = reminder.time;
      console.log(`Checking reminder for ${reminder.medicationName} scheduled at ${reminderTime} on ${currentDay}`);
      
      // Check if the current time matches or is within a minute of the reminder time
      if (isTimeMatching(reminderTime, currentTime)) {
        console.log(`Found matching time for ${reminder.medicationName}!`);
        
        // Generate a unique key for this alarm instance
        const alarmKey = `${reminder._id}-${reminderTime}-${currentDay}`;
        
        // Only trigger if we haven't triggered this alarm yet in this session
        if (!alarmState[alarmKey]) {
          console.log(`Triggering alarm for ${reminder.medicationName} at ${currentTime}`);
          foundDueReminder = true;
          triggerAlarm(reminder);
          
          // Mark this alarm as triggered
          setAlarmState(prev => ({
            ...prev,
            [alarmKey]: true
          }));
          
          // Reset the alarm state after a day so it can trigger again tomorrow
          setTimeout(() => {
            console.log(`Resetting alarm state for ${reminder.medicationName}`);
            setAlarmState(prev => ({
              ...prev,
              [alarmKey]: false
            }));
          }, 24 * 60 * 60 * 1000); // 24 hours
        } else {
          console.log(`Alarm for ${reminder.medicationName} at ${reminderTime} was already triggered today`);
        }
      } else {
        console.log(`Time for ${reminder.medicationName} (${reminderTime}) doesn't match current time (${currentTime})`);
      }
    });
    
    if (!foundDueReminder) {
      console.log('No due reminders found at this time');
    }
    
    // Update upcoming reminders
    findUpcomingReminders();
  };
  
  const triggerAlarm = (reminder) => {
    console.log(`🚨 TRIGGERING ALARM for ${reminder.medicationName} 🚨`);
    
    // Play sound
    playAlarmSound();
    
    // Show browser notification if supported
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const notification = new Notification('Medication Reminder', {
            body: `Time to take ${reminder.medicationName} ${reminder.dosage || ''}`,
            icon: '/favicon.ico',
            tag: `med-reminder-${reminder._id}`,
            requireInteraction: true
          });
          
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
          
          console.log('✅ Browser notification shown');
        } catch (error) {
          console.error('❌ Failed to show notification:', error);
        }
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          console.log('Notification permission response:', permission);
          if (permission === 'granted') {
            try {
              const notification = new Notification('Medication Reminder', {
                body: `Time to take ${reminder.medicationName} ${reminder.dosage || ''}`,
                icon: '/favicon.ico',
                tag: `med-reminder-${reminder._id}`,
                requireInteraction: true
              });
              
              notification.onclick = () => {
                window.focus();
                notification.close();
              };
              
              console.log('✅ Browser notification shown after permission granted');
            } catch (error) {
              console.error('❌ Failed to show notification after permission granted:', error);
            }
          }
        });
      }
    }
    
    // Show toast notification that stays for longer duration
    toast('Medication Reminder', {
      description: `Time to take ${reminder.medicationName} ${reminder.dosage || ''}`,
      action: {
        label: 'Dismiss',
        onClick: () => stopAlarmSound()
      },
      duration: 30000, // 30 seconds
      onDismiss: stopAlarmSound
    });
  };
  
  const playAlarmSound = () => {
    console.log('🔔 ATTEMPTING TO PLAY ALARM SOUND 🔔');
    
    // Try multiple approaches to ensure sound plays
    let soundPlayed = false;
    
    // Approach 1: Use the preloaded audio element
    if (audioElement) {
      try {
        console.log('Trying main audio element');
        
        // Create a clone of the audio element to avoid issues with multiple plays
        const audioClone = audioElement.cloneNode(true);
        
        // Reset to beginning and ensure volume is up
        audioClone.currentTime = 0;
        audioClone.volume = 1.0;
        audioClone.loop = true; // Loop until dismissed
        
        // Play the sound
        const playPromise = audioClone.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅ Main alarm sound playing successfully');
              soundPlayed = true;
              
              // Stop after 10 seconds if not manually stopped
              setTimeout(() => {
                if (audioClone) {
                  audioClone.pause();
                  audioClone.currentTime = 0;
                }
              }, 10000);
            })
            .catch(e => {
              console.error('❌ Failed to play main alarm sound:', e);
              // Will try fallbacks
            });
        }
      } catch (e) {
        console.error('Error with main audio element:', e);
      }
    } else {
      console.warn('No main audio element available');
    }
    
    // Approach 2: Create a new Audio object on the fly
    if (!soundPlayed) {
      try {
        console.log('Trying new audio element approach');
        
        // Try multiple sources
        const sources = [
          '/sounds/alarm.mp3',
          `${window.location.origin}/sounds/alarm.mp3`,
          '/alarm.mp3',
          `${window.location.origin}/alarm.mp3`
        ];
        
        // Try each source until one works
        let sourceIndex = 0;
        
        const tryNextSource = () => {
          if (sourceIndex >= sources.length) {
            console.error('All audio sources failed');
            return;
          }
          
          const source = sources[sourceIndex++];
          console.log(`Trying audio source: ${source}`);
          
          const newAudio = new Audio(source);
          newAudio.volume = 1.0;
          newAudio.play()
            .then(() => {
              console.log(`✅ Alarm playing from source: ${source}`);
              soundPlayed = true;
              
              // Stop after 10 seconds
              setTimeout(() => {
                newAudio.pause();
                newAudio.currentTime = 0;
              }, 10000);
            })
            .catch(e => {
              console.error(`❌ Failed to play from source ${source}:`, e);
              tryNextSource(); // Try next source
            });
        };
        
        tryNextSource();
      } catch (e) {
        console.error('Error creating new audio:', e);
      }
    }
    
    // Approach 3: Try to vibrate on mobile devices
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([500, 200, 500, 200, 500]);
        console.log('📳 Device vibration triggered');
      } catch (e) {
        console.error('Vibration failed:', e);
      }
    }
    
    // Approach 4: Web Audio API as final fallback
    if (!soundPlayed) {
      try {
        console.log('Trying Web Audio API as fallback');
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        
        // Create a gain node for volume
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Start and stop after 2 seconds
        oscillator.start();
        console.log('✅ Web Audio API sound started');
        
        setTimeout(() => {
          oscillator.stop();
          console.log('Web Audio API sound stopped');
        }, 2000);
      } catch (e) {
        console.error('❌ Web Audio API fallback failed:', e);
      }
    }
    
    // Visual notification in the toast as a fallback
    toast('MEDICATION REMINDER ALARM!', {
      description: 'Time to take your medication',
      icon: '🔔',
      style: { 
        backgroundColor: '#FF2E2E', 
        color: 'white',
        borderColor: '#FF8F8F',
        fontWeight: 'bold'
      },
      duration: 10000,
    });
  };
  
  const stopAlarmSound = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  };
  
  const handleOpenDialog = (reminder = null) => {
    if (reminder) {
      setIsEditing(true);
      setCurrentReminder(reminder);
      setReminderForm({
        medicationName: reminder.medicationName || '',
        dosage: reminder.dosage || '',
        time: reminder.time || '08:00',
        daysOfWeek: reminder.daysOfWeek || [],
        notes: reminder.notes || '',
        isActive: reminder.isActive !== false
      });
    } else {
      setIsEditing(false);
      setCurrentReminder(null);
      setReminderForm({
        medicationName: '',
        dosage: '',
        time: '08:00',
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        notes: '',
        isActive: true
      });
    }
    setDialogOpen(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReminderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDayToggle = (day) => {
    setReminderForm(prev => {
      const currentDays = [...prev.daysOfWeek];
      
      if (currentDays.includes(day)) {
        return {
          ...prev,
          daysOfWeek: currentDays.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          daysOfWeek: [...currentDays, day]
        };
      }
    });
  };
  
  const handleToggleActive = async (reminder) => {
    try {
      await patientService.updateMedicationReminder(reminder._id, {
        ...reminder,
        isActive: !reminder.isActive
      });
      
      // Update local state
      setReminders(prevReminders => 
        prevReminders.map(r => 
          r._id === reminder._id 
            ? { ...r, isActive: !r.isActive } 
            : r
        )
      );
      
      toast.success(`Reminder ${!reminder.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling reminder status:', error);
      toast.error('Failed to update reminder status');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!reminderForm.medicationName) {
        toast.error('Medication name is required');
        return;
      }
      
      if (reminderForm.daysOfWeek.length === 0) {
        toast.error('Please select at least one day');
        return;
      }

      // Validate time format (should be HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(reminderForm.time)) {
        toast.error('Please enter a valid time in HH:MM format');
        return;
      }
      
      // Ensure time is in the correct format (HH:MM)
      const [hours, minutes] = reminderForm.time.split(':').map(num => parseInt(num, 10));
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        toast.error('Invalid time: Hours must be 0-23 and minutes must be 0-59');
        return;
      }
      
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const formattedForm = {
        ...reminderForm,
        time: formattedTime
      };
      
      setLoading(true);
      
      if (isEditing && currentReminder) {
        // Update existing reminder
        const response = await patientService.updateMedicationReminder(
          currentReminder._id, 
          formattedForm
        );
        
        // Update reminders list
        setReminders(prevReminders => 
          prevReminders.map(reminder => 
            reminder._id === currentReminder._id 
              ? response.data.data.reminder 
              : reminder
          )
        );
        
        toast.success('Reminder updated successfully');
      } else {
        // Add new reminder
        const response = await patientService.addMedicationReminder(formattedForm);
        
        // Add to reminders list
        setReminders(prevReminders => [...prevReminders, response.data.data.reminder]);
        
        toast.success('Reminder created successfully');
      }
      
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Failed to save reminder');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (reminderId) => {
    try {
      setLoading(true);
      
      await patientService.deleteMedicationReminder(reminderId);
      
      // Remove from reminders list
      setReminders(prevReminders => 
        prevReminders.filter(reminder => reminder._id !== reminderId)
      );
      
      toast.success('Reminder deleted successfully');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    } finally {
      setLoading(false);
    }
  };
  
  // Group reminders by time
  const groupRemindersByTime = () => {
    const groups = {};
    
    reminders.forEach(reminder => {
      if (!groups[reminder.time]) {
        groups[reminder.time] = [];
      }
      groups[reminder.time].push(reminder);
    });
    
    // Sort by time
    return Object.keys(groups)
      .sort()
      .map(time => ({
        time,
        reminders: groups[time]
      }));
  };
  
  const reminderGroups = groupRemindersByTime();
  
  // Update current time and check for upcoming reminders
  const updateCurrentTime = () => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setCurrentTime(timeString);
    
    // Find reminders scheduled for the next 2 hours
    // Only update upcoming reminders every minute instead of every second to reduce processing
    if (now.getSeconds() === 0) {
      findUpcomingReminders();
    }
  };
  
  // Find reminders that are coming up in the next 2 hours
  const findUpcomingReminders = () => {
    const now = new Date();
    const currentDay = getTodayDayName();
    const currentHourInMinutes = (now.getHours() * 60) + now.getMinutes();
    
    // Filter reminders for today that are within the next 2 hours (120 minutes)
    const upcoming = reminders
      .filter(reminder => {
        if (!reminder.isActive || !reminder.daysOfWeek.includes(currentDay)) {
          return false;
        }
        
        const [hours, minutes] = reminder.time.split(':').map(Number);
        const reminderTimeInMinutes = (hours * 60) + minutes;
        const minutesUntilReminder = reminderTimeInMinutes - currentHourInMinutes;
        
        // Only include if it's coming up within 2 hours but not overdue by more than 15 minutes
        return minutesUntilReminder <= 120 && minutesUntilReminder > -15;
      })
      .map(reminder => {
        const [hours, minutes] = reminder.time.split(':').map(Number);
        const reminderTimeInMinutes = (hours * 60) + minutes;
        const currentTimeInMinutes = (now.getHours() * 60) + now.getMinutes();
        const minutesRemaining = reminderTimeInMinutes - currentTimeInMinutes;
        
        return {
          ...reminder,
          minutesRemaining
        };
      })
      .sort((a, b) => a.minutesRemaining - b.minutesRemaining);
    
    setUpcomingReminders(upcoming);
  };
  
  if (loading && reminders.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          <Bell className="mr-2 h-6 w-6 text-indigo-600" />
          Care & Reminders
        </h1>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-all duration-200" onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Reminder
        </Button>
      </div>
      
      {/* Current Time Display */}
      <Card className="mb-8 shadow-lg border border-blue-100 overflow-hidden rounded-xl">
        <CardContent className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-indigo-800">Current Time</h2>
              <p className="text-2xl font-bold text-gray-800">
                {/* Update to show seconds in the time display */}
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-sm text-indigo-600 font-medium">
                {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {upcomingReminders.length > 0 && (
              <div className="text-right">
                <h3 className="text-md font-bold text-indigo-800">Next Reminder</h3>
                <p className="text-xl font-bold text-indigo-700">
                  {upcomingReminders[0].medicationName}
                </p>
                <div className="text-sm">
                  {upcomingReminders[0].minutesRemaining <= 0 ? (
                    <span className="text-red-600 font-bold">Due now!</span>
                  ) : upcomingReminders[0].minutesRemaining === 1 ? (
                    <span className="text-amber-600 font-bold">In 1 minute</span>
                  ) : (
                    <span className="text-gray-700 font-medium">
                      In {upcomingReminders[0].minutesRemaining} minutes 
                      ({formatTime(upcomingReminders[0].time)})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <Card className="mb-8 shadow-lg border border-blue-100 overflow-hidden rounded-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center text-white">
              <AlarmClock className="mr-2 h-5 w-5" />
              Upcoming Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-blue-100">
              {upcomingReminders.map(reminder => (
                <li 
                  key={reminder._id} 
                  className={`p-4 flex items-center justify-between ${
                    reminder.minutesRemaining <= 0 ? 'bg-red-50' : 
                    reminder.minutesRemaining < 15 ? 'bg-amber-50' : 
                    'bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`mr-4 p-3 rounded-full shadow-sm ${
                      reminder.minutesRemaining <= 0 ? 'bg-red-100' : 
                      reminder.minutesRemaining < 15 ? 'bg-amber-100' : 
                      'bg-green-100'
                    }`}>
                      <Pill className={`h-5 w-5 ${
                        reminder.minutesRemaining <= 0 ? 'text-red-600' : 
                        reminder.minutesRemaining < 15 ? 'text-amber-600' : 
                        'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {reminder.medicationName}
                        {reminder.dosage && (
                          <span className="ml-1 text-sm text-indigo-600 font-medium">
                            ({reminder.dosage})
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center text-xs mt-1">
                        <Clock className="mr-1 h-3 w-3" />
                        <span className={
                          reminder.minutesRemaining <= 0 ? 'text-red-600 font-bold' : 
                          reminder.minutesRemaining < 15 ? 'text-amber-600 font-bold' : 
                          'text-indigo-600 font-medium'
                        }>
                          {formatTime(reminder.time)}
                          {reminder.minutesRemaining <= 0 ? (
                            <span className="ml-2">Due now!</span>
                          ) : (
                            <span className="ml-2">
                              in {reminder.minutesRemaining} {reminder.minutesRemaining === 1 ? 'minute' : 'minutes'}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {reminders.length === 0 ? (
        <Card className="mb-8 shadow-lg border border-blue-100 overflow-hidden rounded-xl">
          <CardContent className="flex flex-col items-center justify-center p-10 bg-gradient-to-r from-blue-50 to-indigo-50">
            <AlarmClock className="h-16 w-16 text-indigo-400 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-indigo-800">No Medication Reminders</h2>
            <p className="text-gray-700 text-center mb-6">
              Set up reminders for your medications to get notifications when it's time to take them.
            </p>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-all duration-200" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {reminderGroups.map(({ time, reminders }) => (
            <Card key={time} className="overflow-hidden shadow-lg border border-blue-100 rounded-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg text-white">
                    <Clock className="mr-2 h-5 w-5" />
                    {formatTime(time)}
                  </CardTitle>
                  <div className="text-sm text-white/80">
                    {reminders.length} {reminders.length === 1 ? 'medication' : 'medications'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-blue-100">
                  {reminders.map(reminder => (
                    <li 
                      key={reminder._id} 
                      className={`p-4 flex items-center justify-between ${!reminder.isActive ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center">
                        <div className={`mr-4 p-3 rounded-full shadow-sm ${reminder.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Pill className={`h-5 w-5 ${reminder.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {reminder.medicationName}
                            {reminder.dosage && <span className="ml-1 text-sm text-indigo-600 font-medium">({reminder.dosage})</span>}
                          </h3>
                          <div className="flex items-center text-xs text-indigo-600 font-medium mt-1">
                            <Calendar className="mr-1 h-3 w-3" />
                            <span>{reminder.daysOfWeek.join(', ')}</span>
                          </div>
                          {reminder.notes && (
                            <p className="text-sm mt-1 text-gray-600">{reminder.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleToggleActive(reminder)}
                                className="hover:bg-blue-50"
                              >
                                {reminder.isActive ? (
                                  <ToggleRight className="h-5 w-5 text-green-500" />
                                ) : (
                                  <ToggleLeft className="h-5 w-5 text-gray-400" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {reminder.isActive ? 'Deactivate' : 'Activate'} reminder
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="shadow-lg border border-blue-100">
                            <DropdownMenuItem onClick={() => handleOpenDialog(reminder)} className="hover:bg-blue-50 text-indigo-700">
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(reminder._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Reminder Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-blue-100 shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 -mt-6 px-6 pt-4 pb-3 rounded-t-xl">
            <DialogTitle className="text-lg text-indigo-800">{isEditing ? 'Edit Reminder' : 'Add Medication Reminder'}</DialogTitle>
            <DialogDescription className="text-gray-700 text-sm">
              Create a reminder for your medication. You'll get a notification when it's time to take it.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-3 py-3">
              <div className="grid gap-1">
                <Label htmlFor="medicationName" className="text-sm font-bold text-indigo-800">Medication Name*</Label>
                <Input
                  id="medicationName"
                  name="medicationName"
                  value={reminderForm.medicationName}
                  onChange={handleInputChange}
                  placeholder="Enter medication name"
                  required
                  className="border-2 border-indigo-100 focus:border-indigo-300"
                />
              </div>
              
              <div className="grid gap-1">
                <Label htmlFor="dosage" className="text-sm font-bold text-indigo-800">Dosage</Label>
                <Input
                  id="dosage"
                  name="dosage"
                  value={reminderForm.dosage}
                  onChange={handleInputChange}
                  placeholder="e.g., 1 tablet, 10mg"
                  className="border-2 border-indigo-100 focus:border-indigo-300"
                />
              </div>
              
              <div className="grid gap-1">
                <Label htmlFor="time" className="text-sm font-bold text-indigo-800">Time*</Label>
                <div className="space-y-1">
                  <Input
                    id="customTime"
                    type="time"
                    name="time"
                    value={reminderForm.time}
                    onChange={handleInputChange}
                    className="border-2 border-indigo-100 focus:border-indigo-300"
                    required
                  />
                  <p className="text-xs text-indigo-600 mt-1">
                    24-hour format (HH:MM)
                  </p>
                </div>
              </div>
              
              <div className="grid gap-1">
                <Label className="text-sm font-bold text-indigo-800">Days of Week*</Label>
                <div className="flex flex-wrap gap-1">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center space-x-1">
                      <Checkbox 
                        id={`day-${day}`} 
                        checked={reminderForm.daysOfWeek.includes(day)}
                        onCheckedChange={() => handleDayToggle(day)}
                        className="border-indigo-300 text-indigo-600 data-[state=checked]:bg-indigo-600 h-4 w-4"
                      />
                      <Label htmlFor={`day-${day}`} className="text-xs text-gray-700">
                        {day.substring(0, 3)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-1">
                <Label htmlFor="notes" className="text-sm font-bold text-indigo-800">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={reminderForm.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional instructions or notes"
                  rows={2}
                  className="border-2 border-indigo-100 focus:border-indigo-300"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={reminderForm.isActive}
                  onCheckedChange={(checked) => 
                    setReminderForm(prev => ({ ...prev, isActive: checked }))
                  }
                  className="data-[state=checked]:bg-indigo-600"
                />
                <Label htmlFor="isActive" className="text-gray-700">Reminder active</Label>
              </div>
            </div>
            
            <DialogFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 -mb-6 px-6 py-3 rounded-b-xl mt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={loading}
                className="border-blue-200 hover:bg-blue-50 text-indigo-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{isEditing ? 'Update' : 'Create'} Reminder</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Care; 