## "De la descripción a una regla": sobre la variable proyectada se elige un punto
## de corte, y eso ya es una regla de decisión.
suppressMessages({library(dplyr); library(ggplot2); library(MASS)})
source("R/10-datos.R"); set.seed(2026)
suppressMessages(library(ppforest2)); data(crab)
cb <- crab; cb$Type <- factor(cb$Type)
levels(cb$Type) <- c("Azul hembra","Azul macho","Naranja hembra","Naranja macho")
V <- c("FL","RW","CL","CW","BD"); X <- as.matrix(cb[, V]); y <- cb$Type
ld <- lda(X, y); z <- as.numeric(X %*% ld$scaling[,1])
if (mean(z[grepl("Azul", y)]) > mean(z[grepl("Naranja", y)])) z <- -z
azul <- grepl("Azul", y)
cs <- sort(unique(z)); cs <- (head(cs,-1)+tail(cs,-1))/2
acc <- sapply(cs, function(t) mean((z < t) == azul))
corte <- cs[which.max(acc)]
cat(sprintf("corte en %.3f · aciertos separando especie: %.1f %%\n", corte, 100*max(acc)))

CU <- c(`Azul hembra`=JJAA[["celeste"]], `Azul macho`=JJAA[["azul"]],
        `Naranja hembra`=JJAA[["amarillo"]], `Naranja macho`=JJAA[["naranja"]])
p <- ggplot(data.frame(z = z, clase = y), aes(z, fill = clase)) +
  geom_histogram(bins = 34, colour = "white", linewidth = .3) +
  geom_vline(xintercept = corte, linetype = "dashed", colour = "grey20", linewidth = 1.2) +
  annotate("text", x = corte, y = Inf, vjust = 1.5, hjust = -0.08, size = 6.4,
           fontface = "bold", colour = "grey20", label = "punto de corte") +
  scale_fill_manual(values = CU) +
  labs(x = "Valor sobre la dirección hallada", y = NULL) +
    tema(20) + theme(legend.position = "none", axis.text.y = element_blank(), panel.grid.major.x = element_blank(),
                   legend.margin = margin(t = 1), plot.margin = margin(4,6,2,2))
ggsave("img/K4-regla.png", p, width = 8.6, height = 4.6, dpi = 300, bg = "white", type = "cairo")
cat("guardado\n")
