// FeaturedNewsWidget.tsx - Dashboard widget for featured news
"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { newsService, News } from "@/lib/services";
import { Bell, ExternalLink, AlertTriangle, Info, Megaphone } from "lucide-react";
import { format } from "date-fns";

export const FeaturedNewsWidget: React.FC = () => {
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchFeaturedNews();
    }, []);

    const fetchFeaturedNews = async () => {
        try {
            setLoading(true);
            const response = await newsService.getFeaturedNews();
            if (response.success) {
                setNews(response.data);
            }
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch featured news"));
        } finally {
            setLoading(false);
        }
    };

    const getNewsIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'alert':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'announcement':
                return <Megaphone className="h-4 w-4 text-blue-500" />;
            default:
                return <Info className="h-4 w-4 text-green-500" />;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'urgent':
                return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
            case 'high':
                return <Badge variant="outline" className="text-xs border-red-500 text-red-500">High</Badge>;
            case 'medium':
                return <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500">Medium</Badge>;
            case 'low':
                return <Badge variant="secondary" className="text-xs">Low</Badge>;
            default:
                return <Badge variant="outline" className="text-xs">Normal</Badge>;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-blue-500" />
                        Featured News & Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-blue-500" />
                        Featured News & Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">Error Loading News</p>
                        <p className="text-gray-600 mb-4">{error.message}</p>
                        <Button onClick={fetchFeaturedNews}>Try Again</Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-500" />
                    Featured News & Alerts
                </CardTitle>
                <CardDescription>
                    Important updates and announcements
                </CardDescription>
            </CardHeader>
            <CardContent>
                {news.length === 0 ? (
                    <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">No Featured News</p>
                        <p className="text-gray-600">
                            There are no featured news or alerts at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {news.slice(0, 3).map((item) => (
                            <div
                                key={item._id || item.id}
                                className={`p-4 rounded-lg border ${item.priority === 'urgent'
                                        ? 'bg-red-50 border-red-200'
                                        : item.priority === 'high'
                                            ? 'bg-orange-50 border-orange-200'
                                            : 'bg-blue-50 border-blue-200'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {getNewsIcon(item.type)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-medium text-sm truncate">
                                                {item.title}
                                            </h4>
                                            {getPriorityBadge(item.priority)}
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                            {item.content}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                {item.createdAt ? format(new Date(item.createdAt), 'dd-MMM-yyyy') : 'N/A'}
                                            </span>
                                            {item.expiresAt && (
                                                <span className="text-xs text-gray-500">
                                                    Expires: {format(new Date(item.expiresAt), 'dd-MMM-yyyy')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {news.length > 3 && (
                            <div className="text-center pt-2">
                                <Button variant="outline" size="sm">
                                    View All News
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
