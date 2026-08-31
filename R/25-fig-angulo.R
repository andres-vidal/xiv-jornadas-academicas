## Figura principal: la misma nube como viene y desde la dirección hallada.
## Van como dos gráficos separados y no como facetas, porque los ejes significan
## cosas distintas: a la izquierda son medidas, a la derecha son combinaciones.
suppressMessages({library(dplyr); library(ggplot2); library(MASS); library(patchwork)})
source("R/10-datos.R"); set.seed(2026)
suppressMessages(library(ppforest2)); data(crab)
cb <- crab; cb$Type <- factor(cb$Type)
levels(cb$Type) <- c("Azul hembra","Azul macho","Naranja hembra","Naranja macho")
V <- c("FL","RW","CL","CW","BD"); X <- as.matrix(cb[, V]); y <- cb$Type

W <- Reduce(`+`, lapply(levels(y), function(g){ Z <- scale(X[y==g,,drop=FALSE], scale=FALSE); t(Z)%*%Z }))
Tm <- { Z <- scale(X, scale=FALSE); t(Z)%*%Z }
## El índice del informe: suma de cuadrados entre grupos sobre suma total, sumada
## sobre las dimensiones. Verificado contra los cuantiles de la sección 3.2.
B <- Tm - W
indice2 <- function(A) sum(diag(t(A)%*%B%*%A)) / sum(diag(t(A)%*%Tm%*%A))

A0 <- cbind(c(0,0,1,0,0), c(0,0,0,1,0))
ld <- lda(X, y); A1 <- ld$scaling[, 1:2]
cat(sprintf("índice — variables originales: %.3f | proyección hallada: %.3f\n", indice2(A0), indice2(A1)))

CU <- c(`Azul hembra`=JJAA[["celeste"]], `Azul macho`=JJAA[["azul"]],
        `Naranja hembra`=JJAA[["amarillo"]], `Naranja macho`=JJAA[["naranja"]])
panel <- function(A, titulo, ejex, ejey) {
  Z <- scale(X %*% A, scale = FALSE)
  ggplot(data.frame(x = Z[,1], y = Z[,2], clase = y), aes(x, y, colour = clase)) +
    geom_point(size = 4.6, alpha = .9, stroke = 0) +
    scale_colour_manual(values = CU) +
    labs(title = titulo, x = ejex, y = ejey) +
    tema(22) +
    theme(aspect.ratio = 1, axis.text = element_blank(),
          panel.grid.minor = element_blank(), legend.position = "none",
          plot.title = element_text(face = "bold", size = 26, hjust = .5),
          axis.title = element_text(size = 23),
          plot.margin = margin(3, 14, 2, 14))
}
p1 <- panel(A0, "Como vienen los datos",
            "Largo del caparazón", "Ancho del caparazón")
p2 <- panel(A1, "Desde la dirección hallada",
            "Primera dirección hallada", "Segunda dirección hallada")
p <- (p1 | p2) +
  plot_layout(guides = "collect") &
  theme(legend.position = "bottom", legend.title = element_blank(),
        legend.text = element_text(size = 24))
p <- p & guides(colour = guide_legend(override.aes = list(size = 9), nrow = 1))
ggsave("img/K1-angulo-equivocado.png", p, width = 15, height = 7.4, dpi = 300,
       bg = "white", type = "cairo")
cat("guardado\n")
