import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Ahmed Khan",
    avatar: "/assets/images/category/01.jpg",
    text: "A truly trusted and reliable management service. The team is professional and always responsive.",
    rating: 5,
  },
  {
    name: "Fatima Al Fassi",
    avatar: "/assets/images/category/02.jpg",
    text: "The transparency in each step and the clarity of the process is outstanding. Highly recommended!",
    rating: 5,
  },
  {
    name: "Youssef El-Masry",
    avatar: "/assets/images/category/03.jpg",
    text: "This property management service provides complete ease and peace of mind. My unit is in safe hands.",
    rating: 5,
  },
]

export const Testimonials = () => {
  return (
    <section className="py-20 bg-secondary text-card-foreground">
      <div className="container mx-auto text-center max-w-7xl">
        <span className="text-primary font-semibold">TESTIMONIALS</span>
        <h2 className="text-3xl md:text-4xl font-bold font-headline mt-2">What Our Clients Say</h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          We are trusted by clients from all over the world. Here's what they have to say.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-background/50 border-border/20 p-6 text-center transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
              <CardContent className="p-0">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 h-24">"{testimonial.text}"</p>
                <h3 className="font-semibold text-lg text-foreground">{testimonial.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
