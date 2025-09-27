import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Play, AlertCircle, CheckCircle, ExternalLink, Link2, ShieldAlert, Clock, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { isHttpUrl, getDomainFromUrl } from '@/lib/validation';
import { addWatch, getWatches, deleteWatch } from '@/lib/storage';
import { WatchItem, PreviewStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function NewWatch() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>('invalid');
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [recentWatches, setRecentWatches] = useState<WatchItem[]>([]);

  // Load recent watches
  useEffect(() => {
    const watches = getWatches();
    setRecentWatches(watches.slice(0, 6));
  }, []);

  // Validate URL on change
  useEffect(() => {
    if (url.trim()) {
      const isValid = isHttpUrl(url.trim());
      setPreviewStatus(isValid ? 'valid' : 'invalid');
      setUrlError(isValid ? '' : 'Please enter a valid URL starting with http:// or https://');
    } else {
      setPreviewStatus('invalid');
      setUrlError('');
    }
  }, [url]);

  const handlePreview = async () => {
    if (!isHttpUrl(url.trim())) return;
    
    setIsLoading(true);
    setPreviewStatus('loading');
    
    // Simulate loading time
    setTimeout(() => {
      setPreviewStatus('valid');
      setIsLoading(false);
    }, 1500);
  };

  const handleStartWatching = () => {
    if (!isHttpUrl(url.trim())) return;

    const newWatch: WatchItem = {
      id: crypto.randomUUID(),
      url: url.trim(),
      createdAt: new Date().toISOString(),
    };

    addWatch(newWatch);
    const domain = getDomainFromUrl(newWatch.url);
    
    toast({
      title: "Now watching",
      description: domain,
    });
    
    navigate(`/watch/${newWatch.id}/live`);
  };

  const handleDeleteWatch = (id: string) => {
    deleteWatch(id);
    const watches = getWatches();
    setRecentWatches(watches.slice(0, 6));
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getStatusIcon = () => {
    switch (previewStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (previewStatus) {
      case 'valid':
        return 'Valid';
      case 'invalid':
        return 'Invalid';
      case 'loading':
        return 'Loading...';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
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
      
      {/* Hero Section */}
      <div className="relative min-h-screen p-4 sm:p-6 lg:p-8 z-10">
        {/* Account Section - Top Right */}
        <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary/10 rounded-xl flex items-center justify-center animate-scale-in">
            <Eye className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary" />
          </div>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen gap-8 lg:gap-12">
          {/* Left Section - Form */}
          <div className={`text-center w-full max-w-lg lg:max-w-xl animate-fade-in-up transition-all duration-500 ${url.trim() ? 'lg:max-w-md' : ''}`}>
            <div className="mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">Watch Docs</h1>
              <p className="text-muted-foreground text-base sm:text-lg lg:text-xl leading-relaxed">
                Track changes on any web page.
              </p>
            </div>

            {/* URL Input */}
            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                 <Input
                   id="url"
                   type="url"
                   placeholder="https://example.com"
                   value={url}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                   className={`pl-12 sm:pl-14 h-14 sm:h-16 lg:h-18 text-base sm:text-lg lg:text-xl bg-white/90 backdrop-blur-sm ${urlError ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
                   aria-describedby={urlError ? 'url-error' : undefined}
                   aria-invalid={!!urlError}
                 />
              </div>
              {urlError && (
                <Alert variant="destructive" className="animate-slide-down">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription id="url-error">
                    {urlError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 sm:gap-6 mb-8 sm:mb-10">
               <Button
                 onClick={handlePreview}
                 disabled={!isHttpUrl(url.trim()) || isLoading}
                 variant="outline"
                 size="lg"
                 className="flex-1 h-14 sm:h-16 lg:h-18 text-base sm:text-lg bg-white/90 backdrop-blur-sm hover:bg-white/95"
               >
                 <Eye className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                 Preview
               </Button>
               <Button
                 onClick={handleStartWatching}
                 disabled={!isHttpUrl(url.trim())}
                 variant="outline"
                 size="lg"
                 className="flex-1 h-14 sm:h-16 lg:h-18 text-base sm:text-lg bg-white/90 backdrop-blur-sm hover:bg-white/95"
               >
                 <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                 Start Watching
               </Button>
            </div>

              {/* Fine print */}
              <p className="text-sm sm:text-base text-muted-foreground text-center">
                We sandbox the preview; some sites block embedding.
              </p>
            </div>

          {/* Right Section - Preview */}
          {url.trim() && (
            <div className={`w-full max-w-3xl lg:max-w-2xl animate-slide-in-right transition-all duration-[1200ms] ${url.trim() ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
              <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border border-border modern-hover">
                <CardHeader className="pb-4 sm:pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary/20 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full" />
                      </div>
                      <span className="font-mono text-sm sm:text-base text-muted-foreground">{getDomainFromUrl(url)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(url, '_blank')}
                      className="h-8 w-8 sm:h-10 sm:w-10 p-0"
                    >
                      <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-xl overflow-hidden aspect-video bg-muted/20">
                    {isLoading ? (
                      <div className="p-6 sm:p-8 space-y-4 h-full flex flex-col justify-center">
                        <Skeleton className="h-4 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    ) : previewStatus === 'valid' ? (
                      <iframe
                        src={url}
                        className="w-full h-full"
                        sandbox="allow-same-origin allow-scripts"
                        title="Website preview"
                        onError={() => setPreviewStatus('blocked')}
                      />
                    ) : (
                      <div className="p-8 sm:p-12 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                        <ShieldAlert className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 opacity-50" />
                        <p className="mb-4 sm:mb-6 text-sm sm:text-base">
                          {previewStatus === 'invalid' 
                            ? 'Enter a valid URL to see the preview'
                            : 'Preview blocked by website security policy'
                          }
                        </p>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => window.open(url, '_blank')}
                           className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
                         >
                           <ExternalLink className="h-4 w-4 mr-2" />
                           Open in new tab
                         </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>


      {/* Recent Watch Docs Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground">Recent Watch Docs</h2>
             <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-white/90 backdrop-blur-sm hover:bg-white/95">
               View Dashboard
             </Button>
          </div>

          {recentWatches.length === 0 ? (
             <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border border-border animate-fade-in-up">
              <CardContent className="p-8 sm:p-12 text-center">
                <Plus className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-muted-foreground" />
                <h3 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4 text-foreground">No watches yet</h3>
                <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">
                  Create your first watch to start tracking changes on web pages.
                </p>
                 <Button 
                   size="lg"
                   onClick={() => document.getElementById('url')?.focus()}
                   className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   Create your first watch
                 </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentWatches.map((watch, index) => (
                 <Card 
                   key={watch.id} 
                   className="rounded-2xl bg-white/90 backdrop-blur-sm border border-border animate-fade-in-up modern-hover"
                   style={{ animationDelay: `${index * 0.1}s` }}
                 >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate text-foreground">{getDomainFromUrl(watch.url)}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{watch.url}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          {formatTimeAgo(watch.createdAt)}
                        </div>
                        
                        <div className="flex items-center gap-1">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => navigate(`/watch/${watch.id}/live`)}
                             className="h-8 px-2 text-xs sm:text-sm bg-white/90 backdrop-blur-sm hover:bg-white/95"
                           >
                             Open
                           </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 sm:h-10 sm:w-10 p-0 text-destructive hover:text-destructive bg-white/90 backdrop-blur-sm hover:bg-white/95"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent className="bg-white/90 backdrop-blur-sm">
                               <AlertDialogHeader>
                                 <AlertDialogTitle>Delete Watch</AlertDialogTitle>
                                 <AlertDialogDescription>
                                   Are you sure you want to delete this watch? This action cannot be undone.
                                 </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel className="bg-white/90 backdrop-blur-sm hover:bg-white/95">Cancel</AlertDialogCancel>
                                 <AlertDialogAction
                                   onClick={() => handleDeleteWatch(watch.id)}
                                   className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                 >
                                   Delete
                                 </AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
