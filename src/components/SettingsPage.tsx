import { ArrowLeft, User, Bell, Shield, Palette, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface SettingsPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export function SettingsPage({ onBack, onLogout }: SettingsPageProps) {
  const [profile, setProfile] = useState({
    name: 'Ayesha Rahman',
    username: 'ayesha_writes',
    email: 'ayesha@example.com',
    bio: 'Poetry is the echo of the heart | Ghazal & Free Verse',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  });

  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    newsletter: false,
  });

  const [theme, setTheme] = useState('light');

  const handleSaveProfile = () => {
    alert('Profile updated! 🎉');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-blue-50/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl text-gray-900">
            Settings
          </h1>
        </div>

        {/* Settings Content */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full bg-white border border-gray-200 rounded-xl p-1 mb-6">
            <TabsTrigger value="profile" className="flex-1">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex-1">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl text-gray-900 mb-6">
                Profile Information
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-6 mb-6">
                <Avatar className="w-24 h-24 ring-2 ring-rose-100">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback>{profile.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" className="mb-2">
                    Change Avatar
                  </Button>
                  <p className="text-sm text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Form Fields */}
              <div className="space-y-5">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="mt-1 min-h-[100px]"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <Separator className="my-6" />

                <div>
                  <Label htmlFor="password">Change Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="New password"
                    className="mt-1 mb-3"
                  />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    Save Changes
                  </Button>
                  <Button variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl text-gray-900 mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Likes</p>
                    <p className="text-sm text-gray-500">Get notified when someone likes your poem</p>
                  </div>
                  <Switch
                    checked={notifications.likes}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, likes: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Comments</p>
                    <p className="text-sm text-gray-500">Get notified when someone comments on your poem</p>
                  </div>
                  <Switch
                    checked={notifications.comments}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, comments: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">New Followers</p>
                    <p className="text-sm text-gray-500">Get notified when someone follows you</p>
                  </div>
                  <Switch
                    checked={notifications.follows}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, follows: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Newsletter</p>
                    <p className="text-sm text-gray-500">Weekly digest of top poems and poets</p>
                  </div>
                  <Switch
                    checked={notifications.newsletter}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, newsletter: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl text-gray-900 mb-6">
                Appearance Settings
              </h2>

              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {['light', 'dark', 'auto'].map((themeOption) => (
                      <button
                        key={themeOption}
                        onClick={() => setTheme(themeOption)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          theme === themeOption
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className={`w-full h-20 rounded-lg mb-2 ${
                            themeOption === 'light'
                              ? 'bg-white border border-gray-200'
                              : themeOption === 'dark'
                              ? 'bg-gray-900'
                              : 'bg-gradient-to-br from-white to-gray-900'
                          }`}
                        />
                        <p className="text-sm text-gray-900 capitalize">{themeOption}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="mb-3 block">Font Size</Label>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">Small</Button>
                    <Button variant="outline" size="sm" className="bg-rose-50 border-rose-200">
                      Medium
                    </Button>
                    <Button variant="outline" size="sm">Large</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl text-gray-900 mb-6">
                Privacy & Security
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Private Account</p>
                    <p className="text-sm text-gray-500">Only approved followers can see your poems</p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Show Email</p>
                    <p className="text-sm text-gray-500">Display email on your public profile</p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Allow Comments</p>
                    <p className="text-sm text-gray-500">Let others comment on your poems</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div>
                  <h3 className="text-gray-900 mb-3">
                    Blocked Users
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    You haven't blocked any users yet.
                  </p>
                  <Button variant="outline" size="sm">
                    Manage Blocked Users
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="text-gray-900 mb-3">
                    Data & Privacy
                  </h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Download Your Data
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-rose-600 hover:text-rose-700">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Logout Button */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
