## "Proyectar es representar cada observación en un espacio de menor dimensión".
## Esquema deliberadamente pobre en elementos: pocos puntos y dos grupos, porque
## la idea es geométrica y con la nube completa se vuelve ilegible.
suppressMessages({library(dplyr); library(ggplot2)})
source("R/10-datos.R"); set.seed(7)
suppressMessages(library(ppforest2)); data(crab)
cb <- crab; cb$Type <- factor(cb$Type)
levels(cb$Type) <- c("Azul hembra","Azul macho","Naranja hembra","Naranja macho")
d <- cb |> transmute(x = CL, y = CW, clase = Type) |>
  group_by(clase) |> slice_sample(n = 7) |> ungroup()

th <- 40 * pi/180; u <- c(cos(th), sin(th)); n <- c(-u[2], u[1])
cx <- mean(d$x); cy <- mean(d$y); off <- -9   # negativo: la recta va por debajo de la nube
t  <- (d$x - cx)*u[1] + (d$y - cy)*u[2]
d$px <- cx + t*u[1] + n[1]*off
d$py <- cy + t*u[2] + n[2]*off
L <- max(abs(t)) + 3
rec <- data.frame(x = cx + n[1]*off - u[1]*L, y = cy + n[2]*off - u[2]*L,
                  xe = cx + n[1]*off + u[1]*L, ye = cy + n[2]*off + u[2]*L)
COL2 <- c(`Azul hembra`=JJAA[["celeste"]], `Azul macho`=JJAA[["azul"]],
          `Naranja hembra`=JJAA[["amarillo"]], `Naranja macho`=JJAA[["naranja"]])

p <- ggplot(d) +
  geom_segment(aes(x, y, xend = px, yend = py), colour = "grey72",
               linewidth = .5, linetype = "22") +
  geom_segment(data = rec, aes(x, y, xend = xe, yend = ye),
               colour = "grey30", linewidth = 1.6) +
  geom_point(aes(x, y, colour = clase), size = 7, alpha = .45, stroke = 0) +
  geom_point(aes(px, py, colour = clase), size = 7, stroke = 0) +
  annotate("text", x = rec$xe, y = rec$ye, label = "la sombra", hjust = -0.08, vjust = 1.4,
           size = 7, colour = "grey30", fontface = "bold") +
  scale_colour_manual(values = COL2) +
  coord_equal(expand = TRUE, clip = "off") +
  labs(x = "Largo del caparazón", y = "Ancho del caparazón") +
  guides(colour = guide_legend(override.aes = list(size = 8, alpha = 1), nrow = 2)) +
  tema(21) + theme(legend.position = "none", axis.text = element_blank(), panel.grid = element_blank(),
                   panel.border = element_rect(colour = "grey88", fill = NA, linewidth = .4),
                   legend.margin = margin(t = 1), plot.margin = margin(10,16,3,3))
ggsave("img/K2-sombra.png", p, width = 8.6, height = 4.6, dpi = 300, bg = "white", type = "cairo")
cat("guardado\n")
