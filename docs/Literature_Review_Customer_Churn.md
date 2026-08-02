# Literature Review: Computational Intelligence Approaches for Customer Churn Prediction

**Word count (body, excluding table and references): ~1,800**  
**Aligned to:** Compare and critically evaluate recent research and similar applications using different computational intelligence approaches (LO1, LO3)

---

## 2. Literature Review

Customer churn prediction aims to identify customers who are likely to leave a service, which is a major problem in telecom and subscription businesses because replacing a lost customer usually costs more than keeping an existing one (Imani et al., 2025). The Kaggle Playground Series S6E3 task follows the same problem: binary classification of telecom churn from demographic, service and billing features, with ROC-AUC as the main evaluation measure. Recent work treats this as a computational intelligence (CI) problem rather than a simple statistical one, because the data are often large, noisy, categorical, and class-imbalanced (Imani and Arabnia, 2023; Suguna et al., 2025). This review compares nine recent studies (2022–2025) that use different CI families—kernel methods, fuzzy and swarm optimisation, evolutionary search, bagging and boosting ensembles, stacking, and hybrid deep learning—and then critically evaluates their methods, results and limits for a telecom churn project.

### 2.1 Classical and kernel-based machine learning

Y, Ly and Son (2022) built kernel Support Vector Machine (SVM) models for telecom churn and combined them with sequential feature selection and hybrid resampling (SMOTE-Tomek and SMOTE-ENN). On a public Kaggle telecom set, their best RBF kernel pipeline reached about 99% F1-score and 98.9% accuracy after tuning (Y, Ly and Son, 2022). The strength of this study is its clear experimental path: baseline kernels, then feature selection, then imbalance handling. However, the reported scores are unusually high for real churn data, which raises questions about leakage, small test sets, or overfitting to synthetic samples created by SMOTE-ENN (Y, Ly and Son, 2022). For large competition-style data such as S6E3, kernel SVMs also scale poorly compared with tree ensembles, so the method is useful as a strong classical baseline but less practical as the main production model.

A related traditional CI path is bagging with oversampling. Feng (2022) proposed Borderline-SMOTE with Random Forest for bank churn and showed roughly a 4% gain over KNN, decision trees and Naïve Bayes using OOB error, AUC, precision, recall and F-measure. Borderline-SMOTE is more careful than plain SMOTE because it focuses on minority cases near the decision boundary (Feng, 2022). Still, the work is domain-limited (banking), and Random Forest alone is often weaker than modern gradient boosting on tabular telecom features (Imani and Arabnia, 2023). The useful lesson for this project is not the exact algorithm pair, but that imbalance handling must sit inside the training pipeline and be judged with AUC and recall, not accuracy alone.

### 2.2 Fuzzy systems and metaheuristic optimisation

Banu et al. (2022) presented AICCP-TBM, a CI pipeline that uses Chaotic Salp Swarm Optimisation for feature selection, a Fuzzy Rule-based Classifier for prediction, and Quantum Particle Swarm Optimisation to tune membership functions. Across three churn datasets they reported peak accuracies of 97.25%, 97.5% and 94.33% (Banu et al., 2022). Compared with black-box deep models, fuzzy rules are more interpretable, which matters for retention teams who need reasons, not only scores. Critically, though, the paper is heavily optimisation-driven: many moving parts make reproduction harder, and high accuracy without a full discussion of ROC-AUC, cost-sensitive thresholds, or deployment cost weakens the business claim (Banu et al., 2022; Imani et al., 2025). For S6E3-style work, fuzzy–swarm hybrids are interesting for feature selection and explainability, but gradient boosting plus SHAP usually gives a better speed–accuracy balance.

### 2.3 Evolutionary computational intelligence

Rahman and Kumar (2023) combined Decision Trees with a Genetic Algorithm (DT-GA) for bank churn, arguing that greedy tree induction can give suboptimal structures and that ensembles often hurt interpretability. DT-GA improved accuracy, precision, recall, F1, balanced accuracy and ROC-AUC over a standard scikit-learn tree (Rahman and Kumar, 2023). This is a fair point: evolutionary search can repair the greediness of classical trees while keeping a readable model. However, the comparison set is thin against CatBoost or LightGBM, and the dataset is small and banking-focused, so transfer to multi-hundred-thousand-row telecom data is uncertain (Rahman and Kumar, 2023; Imani and Arabnia, 2023). In short, DT-GA is a good teaching example of evolutionary CI, but current tabular benchmarks favour boosting trees over evolved single trees.

### 2.4 Ensemble learning: bagging, boosting and stacking

Ensemble methods dominate recent churn literature (Imani et al., 2025). Liu, Fan, Zhang, Yin and Song (2023) framed telecom churn as both prediction and segmentation: after predicting risk, they segmented customers to support different retention actions. Linking prediction to marketing segments is stronger than many pure “accuracy papers”, because businesses need actionable groups, not only labels (Liu et al., 2023). A limitation is that ensemble gains are still reported mainly with standard classification metrics; profit or campaign-cost metrics remain rare, a gap also noted by Imani et al. (2025).

Imani and Arabnia (2023) give one of the clearest head-to-head telecom comparisons: ANN, Decision Tree, SVM, Random Forest, Logistic Regression, XGBoost, LightGBM and CatBoost, plus SMOTE, SMOTE-Tomek and SMOTE-ENN, and Optuna tuning. CatBoost reached about 93% F1 after Optuna, while XGBoost and CatBoost both reached about 91% ROC-AUC under their best settings (Imani and Arabnia, 2023). This study is directly relevant to S6E3 because it uses public telecom-style tabular data and the same model family that usually leads Kaggle leaderboards. Critically, hyperparameter search helped some metrics more than others, and sampling choice changed rankings, so “best model” depends on the metric and preprocessing path (Imani and Arabnia, 2023). That finding warns against fixing one algorithm early.

Suguna et al. (2025) revisited the imbalance issue with nine single classifiers and six homogeneous ensembles, then applied SMOTE. Overall accuracy rose from about 61% to 79% after balancing, and AdaBoost reached an F1-score of 87.6% (Suguna et al., 2025). The paper confirms that ensembles without balancing still bias toward the majority class. A weakness is the reliance on accuracy as a headline metric before SMOTE; for churn, recall of churners and ROC-AUC are more decision-relevant (Suguna et al., 2025; Y, Ly and Son, 2022). Also, AdaBoost is competitive but often beaten by LightGBM/CatBoost on rich categorical telecom data (Imani and Arabnia, 2023).

Gu (2023) studied stacking on a Kaggle telecom set: single XGBoost reached 86.20% accuracy, while stacking XGBoost with Random Forest improved test accuracy to 86.51% with much higher training-set accuracy. Stacking can combine complementary errors, which matches strong Kaggle practice. However, the large train–test gap hints at overfitting risk, and the accuracy-only focus underplays AUC, the official S6E3 metric (Gu, 2023; Imani et al., 2025).

### 2.5 Hybrid deep learning approaches

Deep hybrids try to capture nonlinear and sequential structure that shallow models miss. Hao (2024) proposed BiGRU-Attention-XGBoost: BiGRU and Attention encode behaviour features, then XGBoost classifies. With balancing and 10-fold CV on open telecom data, the hybrid reached about 88% accuracy and 90% recall and beat common ML/DL baselines (Hao, 2024). Liu, Xia, Zhang, Ma and Yu (2024) went further with CCP-Net (Multi-Head Self-Attention + BiLSTM + CNN) and ADASYN balancing. On telecom data they reported 92.19% precision, with similarly high results on bank, insurance and news sets, improving 1–3% over other hybrid nets (Liu et al., 2024).

These papers show architecture ambition, but several criticisms apply. First, standard telecom tabular rows are not true time series; forcing BiLSTM/GRU may overfit noise unless temporal order is real (Liu et al., 2024; Hao, 2024). Second, deep hybrids are harder to train and explain than CatBoost/LightGBM, while recent reviews still find ensembles dominant for structured churn data (Imani et al., 2025). Third, modest 1–3% gains must be weighed against compute cost and instability. For S6E3, hybrids are useful as diversity members in an ensemble, not necessarily as the only model.

### 2.6 Critical cross-comparison

Across the nine studies, three patterns appear. **(1) Imbalance handling is non-optional.** SMOTE variants, ADASYN and Borderline-SMOTE repeatedly lift minority-class detection (Feng, 2022; Y, Ly and Son, 2022; Imani and Arabnia, 2023; Liu et al., 2024; Suguna et al., 2025). Yet synthetic oversampling can inflate scores if validation is not careful, which may help explain extreme SVM results (Y, Ly and Son, 2022). **(2) Tree ensembles are the practical sweet spot** for tabular telecom features: Imani and Arabnia (2023), Gu (2023) and Liu et al. (2023) show strong and relatively stable results with less design risk than fuzzy–swarm or deep hybrids (Banu et al., 2022; Hao, 2024; Liu et al., 2024). **(3) Interpretability and business metrics are still thin.** Fuzzy rules (Banu et al., 2022) and DT-GA (Rahman and Kumar, 2023) keep meaning, and Liu et al. (2023) link prediction to segments, but most papers stop at accuracy/F1/AUC and ignore profit or retention cost (Imani et al., 2025).

For this project, the literature therefore supports a pipeline of: careful class balancing or class weighting, gradient boosting (CatBoost/LightGBM/XGBoost) as core predictors, optional stacking for diversity, and SHAP or rule summaries for explanation—while treating heavy deep hybrids as secondary experiments unless clear temporal features exist.

### 2.7 Comparison table

**Table 1. Summary comparison of recent churn-prediction studies (2022–2025)**

| Study | CI approach | Domain / data | Key techniques | Main reported outcome | Critical limitation |
| --- | --- | --- | --- | --- | --- |
| Y, Ly & Son (2022) | Kernel ML | Telecom (Kaggle) | RBF/Poly SVM, SFS/SBS, SMOTE-ENN | ~99% F1; ~98.9% accuracy | Scores may be optimistic; SVM scales poorly |
| Banu et al. (2022) | Fuzzy + swarm CI | Telecom benchmarks | CSSO-FS, Fuzzy rules, QPSO | Up to 97.5% accuracy | Complex, hard to reproduce; weak business metrics |
| Feng (2022) | Bagging + sampling | Banking | Borderline-SMOTE + RF | ~4% lift vs simple classifiers | Not telecom; RF often beaten by boosting |
| Rahman & Kumar (2023) | Evolutionary CI | Banking (Kaggle) | Decision Tree + GA | Better than baseline DT on AUC/F1 | Weak vs modern boosters; small/banking data |
| Liu et al. (2023) | Ensemble + CRM use | Telecom | Ensembles + segmentation | Actionable risk segments | Limited profit-based evaluation |
| Imani & Arabnia (2023) | Gradient boosting | Telecom public set | XGB/LGBM/CatBoost, SMOTE variants, Optuna | CatBoost ~93% F1; ~91% ROC-AUC | Rankings shift with metric/sampling |
| Gu (2023) | Stacking ensemble | Telecom (Kaggle) | Stack XGBoost + RF | Test accuracy ~86.51% | Accuracy-focused; possible overfitting |
| Hao (2024) | Hybrid DL + boosting | Telecom open data | BiGRU-Attention-XGBoost | ~88% accuracy; ~90% recall | Complexity; tabular ≠ true sequences |
| Liu et al. (2024) | Hybrid deep net | Telecom + other | CCP-Net (Attention-BiLSTM-CNN), ADASYN | Telecom precision 92.19% | Heavy model; modest lift vs cost |
| Suguna et al. (2025) | Homogeneous ensembles | Churn (imbalanced) | SMOTE + AdaBoost etc. | Accuracy 61→79%; AdaBoost F1 87.6% | Accuracy emphasis; AdaBoost vs newer boosters |

---

## Figure guidance (for your report)

Use **2–3 figures** maximum in this chapter so the marking weight stays on analysis, not decoration.

1. **Figure 1 – Taxonomy of CI approaches reviewed**  
   A simple hierarchy or mind-map:  
   `Churn CI methods → (1) Classical/kernel (SVM) → (2) Fuzzy + metaheuristics → (3) Evolutionary (GA) → (4) Ensembles (RF / boosting / stacking) → (5) Hybrid deep learning (BiGRU / CCP-Net)`.  
   Caption example: *Figure 1. Taxonomy of computational intelligence approaches used in recent customer churn studies (2022–2025).*

2. **Figure 2 – Cross-paper performance comparison (schematic bar chart)**  
   Plot **one comparable metric only** (prefer ROC-AUC or F1 where reported). Put study names on the x-axis and scores on the y-axis. Add a note under the figure: scores are not fully comparable because datasets and splits differ.  
   Caption example: *Figure 2. Reported headline metrics across selected studies (illustrative; datasets differ).*

3. **Figure 3 – Conceptual pipeline for this project (derived from the review)**  
   Flow: `Raw telecom features → Cleaning/encoding → Imbalance handling (SMOTE/class weight) → Boosting models (± stacking) → ROC-AUC evaluation → Explainability (SHAP)`.  
   Caption example: *Figure 3. Project modelling pipeline synthesised from the literature gaps and strengths.*

Optional: a **PRISMA-style** mini-flowchart only if your module expects a formal review method diagram; otherwise taxonomy + pipeline is enough.

---

## References (Harvard)

Banu, J.F., Neelakandan, S., Geetha, B.T., Selvalakshmi, V., Umadevi, A. and Martinson, E.O. (2022) ‘Artificial intelligence based customer churn prediction model for business markets’, *Computational Intelligence and Neuroscience*, 2022, Article ID 1703696. Available at: https://doi.org/10.1155/2022/1703696

Feng, L. (2022) ‘Research on customer churn intelligent prediction model based on Borderline-SMOTE and Random Forest’, in *2022 IEEE 4th International Conference on Power, Intelligent Computing and Systems (ICPICS)*. IEEE, pp. (conference paper). Available at: https://doi.org/10.1109/ICPICS55264.2022.9873702

Gu, J. (2023) ‘Research on application of stacking technique in telecom churn prediction’, *Highlights in Science, Engineering and Technology*, 31, pp. 43–52. Available at: https://doi.org/10.54097/hset.v31i.4811

Hao, M. (2024) ‘Telecom customer churn prediction based on BiGRU-Attention-XGBoost model’, in *2024 IEEE Conference*. Available at: https://doi.org/10.1109/AINIT61980.2024.10581856

Imani, M. and Arabnia, H.R. (2023) ‘Hyperparameter optimization and combined data sampling techniques in machine learning for customer churn prediction: a comparative analysis’, *Technologies*, 11(6), 167. Available at: https://doi.org/10.3390/technologies11060167

Imani, M., Joudaki, M., Beikmohammadi, A. and Arabnia, H.R. (2025) ‘Customer churn prediction: a systematic review of recent advances, trends, and challenges in machine learning and deep learning’, *Machine Learning and Knowledge Extraction*, 7(3), 105. Available at: https://doi.org/10.3390/make7030105

Liu, X., Xia, G., Zhang, X., Ma, W. and Yu, C. (2024) ‘Customer churn prediction model based on hybrid neural networks’, *Scientific Reports*, 14, Article 29676. Available at: https://doi.org/10.1038/s41598-024-79603-9

Liu, Y., Fan, J., Zhang, J., Yin, X. and Song, Z. (2023) ‘Research on telecom customer churn prediction based on ensemble learning’, *Journal of Intelligent Information Systems*, 60(3), pp. 759–775. Available at: https://doi.org/10.1007/s10844-022-00739-z

Rahman, M. and Kumar, V. (2023) ‘Decision tree with genetic algorithm for bank customer churn prediction’, in *2023 IEEE 11th Conference on Systems, Process & Control (ICSPC) / SCORED*. IEEE. Available at: https://doi.org/10.1109/SCORED60679.2023.10563975

Suguna, R., Suriya Prakash, J., Aditya Pai, H., Mahesh, T.R., Vinoth Kumar, V. and Yimer, T.E. (2025) ‘Mitigating class imbalance in churn prediction with ensemble methods and SMOTE’, *Scientific Reports*, 15, 16256. Available at: https://doi.org/10.1038/s41598-025-01031-0

Y, N.N., Ly, T.V. and Son, D.V.T. (2022) ‘Churn prediction in telecommunication industry using kernel Support Vector Machines’, *PLoS ONE*, 17(5), e0267935. Available at: https://doi.org/10.1371/journal.pone.0267935

---

## Quick checklist against your marking criteria

- [x] Solid subject understanding linked to telecom churn / S6E3  
- [x] 9–10 recent studies (2022–2025) across different CI approaches  
- [x] Harvard in-text citations throughout  
- [x] Critical comparison (limits, metric issues, scalability, interpretability)  
- [x] Comparison table  
- [x] Figure guidance  
- [x] Harvard reference list  
- [x] Simple academic English (~1,800-word body)

**Tip for submission:** paste the body into Word, run a word count on sections 2.1–2.6 only (exclude table + references), and trim or expand one paragraph if your marker needs exactly 1,800 ±10%.
