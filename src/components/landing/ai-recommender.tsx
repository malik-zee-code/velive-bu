'use client';

import { useState } from 'react';
import { Wand2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { personalizedRecommendations } from '@/ai/flows/personalized-recommendations';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const AiRecommender = () => {
  const [description, setDescription] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please describe your desired experience.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const result = await personalizedRecommendations({ description });
      setRecommendations(result.recommendations);
    } catch (e) {
      console.error(e);
      setError('An error occurred while getting recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTryAnother = () => {
    setDescription('');
    setRecommendations([]);
    setError(null);
  };

  return (
    <section className="py-20">
      <div className="container mx-auto">
        <Card className="max-w-3xl mx-auto shadow-2xl bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 mb-4 rounded-full flex items-center justify-center bg-primary/10 text-primary">
              <Wand2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-headline">Personalized AI Recommendations</CardTitle>
            <CardDescription className="text-lg mt-2">
              Tell us what you're looking for, and our AI will find the perfect spots for you!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendations.length > 0 ? (
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 text-primary">Here are your personalized recommendations:</h3>
                <ul className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-center justify-center gap-3 bg-background p-3 rounded-lg">
                      <Sparkles className="h-5 w-5 text-accent" />
                      <span className="text-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={handleTryAnother} variant="outline" className="mt-8">
                  Try another search
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  placeholder="e.g., 'a quiet, romantic dinner with a view', 'a fun place for kids on a rainy day', or 'an adventurous hike with great photo spots'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="text-base"
                  disabled={isLoading}
                />
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
          {recommendations.length === 0 && (
            <CardFooter>
              <Button onClick={handleSubmit} className="w-full text-lg py-6" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                   <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </section>
  );
};
