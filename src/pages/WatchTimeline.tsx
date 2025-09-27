import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Diff,
  Plus,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getWatches } from '@/lib/storage';
import { WatchItem } from '@/types';

interface TimelineEntry {
  id: string;
  timestamp: Date;
  status: 'captured' | 'changed' | 'error';
  title: string;
  description: string;
  changes?: {
    added: string[];
    removed: string[];
    modified: string[];
  };
  screenshotUrl?: string;
}

export default function WatchTimeline() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [watch, setWatch] = useState<WatchItem | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null);
  const [timelineEntries] = useState<TimelineEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: 'captured',
      title: 'Initial Capture',
      description: 'Website first monitored',
      screenshotUrl: '/placeholder-screenshot.png'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      status: 'changed',
      title: 'Content Updated',
      description: 'Homepage content modifications detected',
      changes: {
        added: ['New product announcement banner', 'Updated pricing section'],
        removed: ['Old promotional banner'],
        modified: ['Navigation menu items', 'Footer links']
      },
      screenshotUrl: '/placeholder-screenshot.png'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      status: 'captured',
      title: 'Periodic Check',
      description: 'Routine monitoring scan completed',
      screenshotUrl: '/placeholder-screenshot.png'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      status: 'error',
      title: 'Access Issue',
      description: 'Temporary connection timeout',
      screenshotUrl: '/placeholder-screenshot.png'
    }
  ]);

  // Load watch data
  useEffect(() => {
    if (id) {
      const watches = getWatches();
      const foundWatch = watches.find((w: WatchItem) => w.id === id);
      if (foundWatch) {
        setWatch(foundWatch);
        // Select the most recent entry by default
        if (timelineEntries.length > 0) {
          setSelectedEntry(timelineEntries[0]);
        }
      } else {
        navigate('/');
      }
    }
  }, [id, navigate, timelineEntries]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'captured':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'changed':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'captured':
        return 'bg-green-500';
      case 'changed':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!watch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative animate-slide-in-left">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: 'url(https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.05&cAzimuthAngle=180&cDistance=2.9&cPolarAngle=120&cameraZoom=1&color1=%23dbf8ff&color2=%23ffffff&color3=%23dbf8ff&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1&positionX=0&positionY=1.8&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=-90&shader=defaults&type=waterPlane&uDensity=1&uFrequency=5.5&uSpeed=0.1&uStrength=3&uTime=0.2&wireframe=false)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Blur and Noise Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px',
          opacity: 0.1,
        }}
      />

      {/* Header */}
      <div className="relative z-10 p-4 sm:p-6 border-b border-border/50 bg-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/20 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              </div>
              <span className="font-mono text-sm text-muted-foreground">{new URL(watch.url).hostname}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/watch/${id}`)}
              className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
            >
              <Eye className="h-4 w-4 mr-2" />
              Live View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(watch.url, '_blank')}
              className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Site
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        {/* Left Side - Timeline */}
        <div className="w-1/3 border-r border-border/50 bg-white/5 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            {/* Timeline Header */}
            <div className="p-4 sm:p-6 border-b border-border/50 bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Timeline</h2>
                  <p className="text-sm text-muted-foreground">Change history and monitoring events</p>
                </div>
              </div>
            </div>

            {/* Timeline Items */}
            <ScrollArea className="flex-1 p-4 sm:p-6">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border/50" />
                
                <div className="space-y-6">
                  {timelineEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`relative flex gap-4 cursor-pointer transition-all duration-200 ${
                        selectedEntry?.id === entry.id 
                          ? 'transform scale-105' 
                          : 'hover:transform hover:scale-102'
                      }`}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      {/* Timeline Dot */}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(entry.status)}`}>
                        {getStatusIcon(entry.status)}
                      </div>
                      
                      {/* Timeline Card */}
                      <Card className={`flex-1 transition-all duration-200 ${
                        selectedEntry?.id === entry.id
                          ? 'bg-white/95 backdrop-blur-sm border-primary shadow-lg'
                          : 'bg-white/80 backdrop-blur-sm border border-border hover:bg-white/90'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-sm text-foreground">{entry.title}</h3>
                            <Badge 
                              variant={entry.status === 'changed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {entry.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{entry.description}</p>
                          <p className="text-xs font-mono text-muted-foreground">
                            {entry.timestamp.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Side - Preview and Changes */}
        <div className="w-2/3 bg-white/5 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            {/* Preview Header */}
            <div className="p-4 sm:p-6 border-b border-border/50 bg-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <ExternalLink className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {selectedEntry ? selectedEntry.title : 'Select Timeline Entry'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedEntry 
                        ? `Captured at ${selectedEntry.timestamp.toLocaleString()}`
                        : 'Choose a timeline entry to view details'
                      }
                    </p>
                  </div>
                </div>
                {selectedEntry && (
                  <Badge 
                    variant={selectedEntry.status === 'changed' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {selectedEntry.status}
                  </Badge>
                )}
              </div>
            </div>

            {/* Content Area */}
            {selectedEntry ? (
              <div className="flex-1 flex">
                {/* Preview Section */}
                <div className="w-2/3 p-4 sm:p-6 border-r border-border/50">
                  <Card className="h-full bg-white/90 backdrop-blur-sm border border-border">
                    <CardContent className="h-full p-0">
                      <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
                        {/* Placeholder for screenshot/preview */}
                        <div className="text-center p-8">
                          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Eye className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Website Preview</h3>
                          <p className="text-sm text-muted-foreground">
                            Screenshot from {selectedEntry.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Changes Section */}
                <div className="w-1/3 p-4 sm:p-6">
                  <Card className="h-full bg-white/90 backdrop-blur-sm border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Diff className="h-4 w-4" />
                        Changes Detected
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ScrollArea className="h-[calc(100%-60px)]">
                        {selectedEntry.changes ? (
                          <div className="space-y-4">
                            {/* Added Items */}
                            {selectedEntry.changes.added.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                                  <Plus className="h-3 w-3" />
                                  Added ({selectedEntry.changes.added.length})
                                </h4>
                                <div className="space-y-1">
                                  {selectedEntry.changes.added.map((item, index) => (
                                    <div key={index} className="text-xs p-2 bg-green-50 border-l-2 border-green-500 rounded">
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Removed Items */}
                            {selectedEntry.changes.removed.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                                  <Minus className="h-3 w-3" />
                                  Removed ({selectedEntry.changes.removed.length})
                                </h4>
                                <div className="space-y-1">
                                  {selectedEntry.changes.removed.map((item, index) => (
                                    <div key={index} className="text-xs p-2 bg-red-50 border-l-2 border-red-500 rounded">
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Modified Items */}
                            {selectedEntry.changes.modified.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
                                  <Diff className="h-3 w-3" />
                                  Modified ({selectedEntry.changes.modified.length})
                                </h4>
                                <div className="space-y-1">
                                  {selectedEntry.changes.modified.map((item, index) => (
                                    <div key={index} className="text-xs p-2 bg-blue-50 border-l-2 border-blue-500 rounded">
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 bg-muted/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                              <CheckCircle className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              No changes detected in this capture
                            </p>
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Select a Timeline Entry</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Click on any timeline entry on the left to view the website preview and change details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
