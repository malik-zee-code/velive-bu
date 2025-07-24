import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "John Doe",
    avatar: "https://placehold.co/100x100",
    text: "This is the best service I have ever used. Highly recommended!",
    rating: 5,
  },
  {
    name: "Jane Smith",
    avatar: "https://placehold.co/100x100",
    text: "Excellent experience and great support. I found exactly what I was looking for.",
    rating: 5,
  },
  {
    name: "Sam Wilson",
    avatar: "https://placehold.co/100x100",
    text: "A fantastic platform with a wide variety of options. Will use again!",
    rating: 5,
  },
]

export const Testimonials = () => {
  return (
    <section className="py-20 bg-card text-card-foreground">
      <div className="container mx-auto text-center">
        <span className="text-primary font-semibold">TESTIMONIALS</span>
        <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2">What Our Clients Say</h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          We are trusted by clients from all over the world. Here's what they have to say.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-background/50 border-border/20 p-6 text-center">
              <CardContent className="p-0">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex justify-center mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                <h3 className="font-semibold text-lg text-foreground">{testimonial.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
