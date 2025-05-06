
    import React, { useState } from 'react';
    import { useTranslation } from 'react-i18next';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
    import { Play, PlusCircle, Trash2, Youtube, Tag } from 'lucide-react'; // Added Tag icon
    import { grades } from '@/data/formData';
    import { useToast } from '@/components/ui/use-toast';
    import { Badge } from '@/components/ui/badge'; // Import Badge

    // Define video sections
    const videoSections = [
      { value: 'introduction', labelKey: 'videoSectionIntroduction' },
      { value: 'sample_lesson', labelKey: 'videoSectionSampleLesson' },
      { value: 'topic_explanation', labelKey: 'videoSectionTopicExplanation' },
      { value: 'problem_solving', labelKey: 'videoSectionProblemSolving' },
      { value: 'other', labelKey: 'videoSectionOther' },
    ];

    const TutorVideoManager = ({ introVideoUrl, otherVideos = [], isOwner, isEditing, onAddVideo, onRemoveVideo, onInputChange }) => {
        const { t } = useTranslation();
        const { toast } = useToast();
        const [newVideoUrl, setNewVideoUrl] = useState('');
        const [newVideoTitle, setNewVideoTitle] = useState('');
        const [newVideoGrade, setNewVideoGrade] = useState('');
        const [newVideoSection, setNewVideoSection] = useState(''); // State for section
        const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
        const [validationError, setValidationError] = useState('');

        const isValidYoutubeUrl = (url) => {
             if (!url) return false;
             const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+(&?.*)?$/;
             return youtubeRegex.test(url);
        };

        const handleAddVideoSubmit = () => {
            setValidationError('');
            if (!newVideoUrl || !newVideoTitle || !newVideoSection) { // Added section validation
                 setValidationError(t('videoTitleUrlSectionRequired')); // Updated translation key
                 return;
            }
            if (!isValidYoutubeUrl(newVideoUrl)) {
                 setValidationError(t('invalidYoutubeUrl'));
                 return;
            }

            onAddVideo({ url: newVideoUrl, title: newVideoTitle, grade: newVideoGrade, section: newVideoSection }); // Pass section
            toast({ title: t('videoAddedSuccess') });
            setNewVideoUrl('');
            setNewVideoTitle('');
            setNewVideoGrade('');
            setNewVideoSection(''); // Reset section
            setIsVideoDialogOpen(false);
        };

        const getEmbedUrl = (url) => {
            if (!url || !isValidYoutubeUrl(url)) return null;
            try {
                const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
                let videoId = null;
                if (urlObj.hostname === 'youtu.be') {
                    videoId = urlObj.pathname.substring(1).split('?')[0];
                } else if (urlObj.hostname.includes('youtube.com')) {
                    videoId = urlObj.searchParams.get('v');
                }
                return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
            } catch (e) {
                console.error("Invalid URL for embed:", url, e);
                return null;
            }
        };

        const introEmbedUrl = getEmbedUrl(introVideoUrl);

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{t('videosTitle')}</CardTitle>
                  <CardDescription>{t('videosDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Introduction Video */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">{t('introVideo')}</h4>
                    {isEditing ? (
                        <Input
                            type="url"
                            placeholder={t('youtubeUrlPlaceholder')}
                            value={introVideoUrl || ''}
                            onChange={(e) => onInputChange('introVideoUrl', e.target.value)}
                            className="h-9 text-sm border-dashed focus-visible:ring-1 focus-visible:ring-offset-1"
                        />
                    ) : introEmbedUrl ? (
                      <div className="aspect-video rounded-lg overflow-hidden border shadow-inner">
                        <iframe src={introEmbedUrl} title={t('introVideo')} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('noIntroVideo')}</p>
                    )}
                  </div>

                  {/* Other Videos */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                       <h4 className="font-medium text-foreground">{t('additionalVideos')}</h4>
                       {isOwner && isEditing && (
                         <Dialog open={isVideoDialogOpen} onOpenChange={(isOpen) => { setIsVideoDialogOpen(isOpen); if (!isOpen) setValidationError(''); }}>
                           <DialogTrigger asChild>
                             <Button variant="outline" size="sm">
                               <PlusCircle size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('addVideo')}
                             </Button>
                           </DialogTrigger>
                           <DialogContent>
                             <DialogHeader>
                               <DialogTitle>{t('addVideo')}</DialogTitle>
                               <DialogDescription>{t('addVideoDesc')}</DialogDescription>
                             </DialogHeader>
                             <div className="space-y-4 py-4">
                               <div>
                                 <Label htmlFor="video-title">{t('videoTitleLabel')}</Label>
                                 <Input id="video-title" value={newVideoTitle} onChange={(e) => setNewVideoTitle(e.target.value)} placeholder={t('videoTitlePlaceholder')} />
                               </div>
                               <div>
                                 <Label htmlFor="video-url">{t('videoUrlLabel')}</Label>
                                 <Input id="video-url" type="url" value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder={t('youtubeUrlPlaceholder')} />
                               </div>
                               <div>
                                  <Label htmlFor="video-section">{t('videoSectionLabel')}</Label> {/* New Label */}
                                  <Select value={newVideoSection} onValueChange={setNewVideoSection}>
                                     <SelectTrigger id="video-section">
                                        <SelectValue placeholder={t('selectVideoSection')} /> {/* New Placeholder */}
                                     </SelectTrigger>
                                     <SelectContent>
                                        {videoSections.map(section => (
                                          <SelectItem key={section.value} value={section.value}>
                                            {t(section.labelKey)}
                                          </SelectItem>
                                        ))}
                                     </SelectContent>
                                  </Select>
                               </div>
                               <div>
                                  <Label htmlFor="video-grade">{t('videoGradeLabel')}</Label>
                                  <Select value={newVideoGrade} onValueChange={setNewVideoGrade}>
                                     <SelectTrigger id="video-grade">
                                        <SelectValue placeholder={t('selectGradeOptional')} />
                                     </SelectTrigger>
                                     <SelectContent>
                                        <SelectItem value="">{t('allGrades')}</SelectItem>
                                        {grades.map(grade => (
                                          <SelectItem key={grade.value} value={grade.value}>
                                            {t(grade.labelKey)}
                                          </SelectItem>
                                        ))}
                                     </SelectContent>
                                  </Select>
                               </div>
                               {validationError && <p className="text-sm text-destructive">{validationError}</p>}
                             </div>
                             <DialogFooter>
                               <DialogClose asChild>
                                 <Button type="button" variant="outline">{t('cancel')}</Button>
                               </DialogClose>
                               <Button type="button" onClick={handleAddVideoSubmit}>{t('addVideo')}</Button>
                             </DialogFooter>
                           </DialogContent>
                         </Dialog>
                       )}
                    </div>

                    {otherVideos.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {otherVideos.map((video) => {
                          const embedUrl = getEmbedUrl(video.url);
                          const sectionLabel = videoSections.find(s => s.value === video.section)?.labelKey;
                          return (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="relative group border rounded-lg p-3 space-y-2 bg-card shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start gap-2">
                                 <div className="flex-grow min-w-0">
                                     <p className="text-sm font-semibold truncate text-card-foreground">{video.title || t('untitledVideo')}</p>
                                     <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                        {video.section && sectionLabel && (
                                            <Badge variant="outline" className="video-section-badge">
                                                <Tag size={12} className="mr-1 rtl:ml-1" />
                                                {t(sectionLabel)}
                                            </Badge>
                                        )}
                                        {video.grade && (
                                            <Badge variant="secondary" className="text-xs">
                                                {t(grades.find(g => g.value === video.grade)?.labelKey || video.grade)}
                                            </Badge>
                                        )}
                                     </div>
                                 </div>
                                 {isOwner && isEditing && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                          <Trash2 size={16} />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>{t('confirmDeletion')}</AlertDialogTitle>
                                          <AlertDialogDescription>{t('confirmVideoDelete')}</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => { onRemoveVideo(video.id); toast({ title: t('videoRemovedSuccess') }); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            {t('delete')}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                 )}
                              </div>
                              {embedUrl ? (
                                <a href={video.url} target="_blank" rel="noopener noreferrer" className="block aspect-video rounded overflow-hidden relative bg-muted group/play">
                                   <div className="absolute inset-0 flex items-center justify-center">
                                       <Youtube size={48} className="text-red-600 opacity-70 group-hover/play:opacity-50 transition-opacity" />
                                   </div>
                                   <div className="absolute inset-0 bg-black/20 group-hover/play:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover/play:opacity-100">
                                      <Play size={36} className="text-white drop-shadow-lg" />
                                   </div>
                                </a>
                              ) : (
                                <div className="aspect-video rounded bg-muted flex items-center justify-center border border-dashed">
                                  <p className="text-xs text-destructive px-2 text-center">{t('invalidVideoUrl')}</p>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed rounded-lg bg-muted/50">
                         <p className="text-sm text-muted-foreground">{t('noAdditionalVideos')}</p>
                         {isOwner && isEditing && <p className="text-xs text-muted-foreground mt-1">{t('clickAddVideoPrompt')}</p>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
        );
    };

    export default TutorVideoManager;
  