# Imagen de la vista previa del enlace (Open Graph), 1200 x 630.
#
# Es lo que muestran WhatsApp, Slack, LinkedIn y el correo cuando se pega la
# dirección de la app. Se ve chica, así que va con poco: el título, una línea de
# contexto y la nube de los cangrejos proyectada sobre las dos discriminantes.
suppressMessages({library(ggplot2); library(MASS); library(ppforest2)})
source("R/10-datos.R")

data(crab); cb <- crab; cb$Type <- factor(cb$Type)
levels(cb$Type) <- c("Azul hembra","Azul macho","Naranja hembra","Naranja macho")
CU <- c(`Azul hembra`=JJAA[["celeste"]], `Azul macho`=JJAA[["azul"]],
        `Naranja hembra`=JJAA[["amarillo"]], `Naranja macho`=JJAA[["naranja"]])
X <- as.matrix(cb[, c("FL","RW","CL","CW","BD")])
Z <- scale(X %*% lda(X, cb$Type)$scaling[, 1:2], scale = FALSE)

p <- ggplot(data.frame(x = Z[,1], y = Z[,2], clase = cb$Type),
            aes(x, y, colour = clase)) +
  geom_point(size = 4.6, alpha = .9, stroke = 0) +
  scale_colour_manual(values = CU) +
  labs(title = "¿Y si miramos por otro lado?",
       subtitle = paste("Búsqueda de proyecciones para revelar estructuras de grupos",
                        "en datos multivariados"),
       caption = "XIV Jornadas Académicas · IESTA, FCEA — Udelar") +
  theme_minimal(base_size = 22, base_family = FUENTE) +
  theme(plot.background  = element_rect(fill = JJAA[["fondo"]], colour = NA),
        panel.background = element_blank(),
        panel.grid = element_blank(),
        axis.title = element_blank(), axis.text = element_blank(),
        legend.position = "none",
        # el título se alinea con el borde de la imagen y no con el panel, que
        # arranca corrido para dejar lugar a unos ejes que acá no van
        plot.title.position = "plot", plot.caption.position = "plot",
        plot.title    = element_text(size = 46, face = "bold", colour = JJAA[["tinta"]]),
        plot.subtitle = element_text(size = 22, colour = "#5a6167", margin = margin(t = 6)),
        plot.caption  = element_text(size = 19, colour = "#5a6167", hjust = 0),
        plot.margin = margin(34, 40, 26, 40))

# 12 x 6,3 pulgadas a 100 ppp son los 1200 x 630 que piden los scrapers
ggsave("assets/og.png", p, width = 12, height = 6.3, dpi = 100,
       bg = JJAA[["fondo"]], type = "cairo")
cat("   assets/og.png", paste(dim(png::readPNG("assets/og.png"))[2:1], collapse = " x "), "\n")
